import React, { useEffect, useState } from 'react';
import { Bell, X, Check, CheckCheck, Bot, Zap, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'info' | 'approval' | 'warning' | 'error' | 'critical' | 'task_complete' | 'task_failed' | 'agent_active';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actions?: { label: string; actionId: string }[];
}

interface Props {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onClear: () => void;
  onDismiss: (id: string) => void;
  onAction?: (notificationId: string, actionId: string) => void;
}

const TYPE_ICON: Record<Notification['type'], React.FC<any>> = {
  info:          Zap,
  approval:      HelpCircle,
  warning:       AlertTriangle,
  error:         AlertTriangle,
  critical:      AlertOctagon,
  task_complete: CheckCheck,
  task_failed:   AlertTriangle,
  agent_active:  Bot,
};

const TYPE_COLOR: Record<Notification['type'], string> = {
  info:          '#ffffff',
  approval:      '#3b82f6',
  warning:       '#f59e0b',
  error:         '#ef4444',
  critical:      '#dc2626',
  task_complete: '#22c55e',
  task_failed:   '#ef4444',
  agent_active:  '#ffffff',
};

export function NotificationCenter({ notifications, onMarkAllRead, onClear, onDismiss, onAction }: Props) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById('notification-panel');
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60_000) return 'just now';
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
    return `${Math.floor(diff / 3600_000)}h ago`;
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button 
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{ 
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#ffffff', width: 32, height: 32, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          position: 'relative',
        }}
      >
        <Bell size={14} />
        {unread > 0 && (
          <div style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unread}
          </div>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div 
          id="notification-panel"
          style={{ 
            position: 'absolute', top: 40, right: 0, width: 340,
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 100,
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Notifications</div>
            {notifications.length > 0 && (
              <>
                <button onClick={onMarkAllRead} style={actionBtn} title="Mark all read">
                  <Check size={12} />
                </button>
                <button onClick={onClear} style={actionBtn} title="Clear all">
                  <X size={12} />
                </button>
              </>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
                No notifications
              </div>
            ) : (
              notifications.slice(0, 20).map(n => {
                const Icon = TYPE_ICON[n.type];
                const color = TYPE_COLOR[n.type];
                return (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex', gap: 10, padding: '10px 14px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: n.read ? 'transparent' : 'rgba(168,85,247,0.04)',
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Icon size={13} color={color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                      
                      {n.actions && n.actions.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          {n.actions.map(act => (
                            <button
                              key={act.actionId}
                              onClick={() => {
                                onAction?.(n.id, act.actionId);
                                onDismiss(n.id);
                              }}
                              style={{
                                background: 'rgba(255,255,255,0.1)', color: '#ffffff',
                                border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 10,
                                fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>{formatTime(n.timestamp)}</div>
                    </div>
                    <button onClick={() => onDismiss(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: 2, flexShrink: 0, display: 'flex', alignSelf: 'flex-start' }}>
                      <X size={11} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.5)', borderRadius: 6, padding: '3px 6px',
  cursor: 'pointer', display: 'flex', alignItems: 'center',
};

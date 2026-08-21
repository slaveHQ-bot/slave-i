import React, { useEffect, useState } from 'react';
import { Bot, CheckCircle, FileText, Folder, CheckSquare, X, Clock, Shield, Database, Activity } from 'lucide-react';

export interface RightPanelContext {
  type: 'agent' | 'task' | 'file' | 'project';
  id: string;
  data?: any; // Prefetched metadata if available
}

interface Props {
  context: RightPanelContext | null;
  onClose: () => void;
}

export function RightPanel({ context, onClose }: Props) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!context) {
      setDetails(null);
      return;
    }
    
    // In a real implementation, we would fetch fresh metadata here
    // based on context.type and context.id via IPC.
    // For now, we simulate loading or just use prefetched data if present.
    let isMounted = true;
    
    if (context.data) {
      setDetails(context.data);
    } else {
      setLoading(true);
      setTimeout(() => {
        if (!isMounted) return;
        setLoading(false);
        // Mock data fetch
        if (context.type === 'agent') {
          setDetails({
            status: 'Idle',
            model: 'GPT-4o',
            tools: ['browser', 'fs_read', 'fs_write'],
            permissions: 'Standard',
            memory: '4.2 MB',
            runs: 142
          });
        } else if (context.type === 'task') {
          setDetails({
            status: 'In Progress',
            subtasks: 3,
            completed: 1,
            timeElapsed: '2m 14s'
          });
        }
      }, 500);
    }
    
    return () => { isMounted = false; };
  }, [context]);

  if (!context) {
    return (
      <div style={{ width: 280, borderLeft: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Context</h3>
          <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4, marginBottom: 0 }}>Select an item to view details.</p>
        </div>
        <div style={{ padding: 16, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>No context active</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (loading) {
      return <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-muted)', fontSize: 12 }}>Loading details...</div>;
    }

    if (!details) {
      return <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-muted)', fontSize: 12 }}>No details available</div>;
    }

    if (context.type === 'agent') {
      return (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={12}/> Status</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#22c55e' }}>{details.status || 'Active'}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Model</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>{details.model || 'Default'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Capabilities</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(details.tools || []).map((t: string) => (
                <span key={t} style={{ fontSize: 10, background: 'rgba(168,85,247,0.15)', color: '#c4b5fd', padding: '2px 6px', borderRadius: 4 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={12}/> Permissions</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>{details.permissions}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Database size={12}/> Memory</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>{details.memory}</span>
          </div>
        </div>
      );
    }

    if (context.type === 'task') {
      return (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={12}/> Status</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>{details.status}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={12}/> Elapsed</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>{details.timeElapsed}</span>
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: 16, color: 'var(--color-muted)', fontSize: 12 }}>
        Preview not available for this type.
      </div>
    );
  };

  const Icon = context.type === 'agent' ? Bot :
               context.type === 'task' ? CheckSquare :
               context.type === 'file' ? FileText : Folder;

  return (
    <div style={{ width: 280, borderLeft: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Icon size={14} color="#e5e5e5" />
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', fontWeight: 600 }}>
              {context.type}
            </span>
          </div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: 0, wordBreak: 'break-all', paddingRight: 12 }}>
            {context.id}
          </h3>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', padding: 4 }}>
          <X size={14} />
        </button>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
}

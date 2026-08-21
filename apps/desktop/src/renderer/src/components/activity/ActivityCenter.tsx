import React, { useEffect, useState } from 'react';
import { Activity, Search, Filter, RefreshCw, Calendar, Terminal, Bot, Shield, AlertTriangle, FileText } from 'lucide-react';

export interface ActivityEvent {
  id: string;
  type: string;
  agent_id?: string;
  task_id?: string;
  description: string;
  created_at: number;
}

export function ActivityCenter() {
  const [logs, setLogs] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data = await window.api.activity.getLogs();
      setLogs(data);
    } catch (e) {
      console.error('Failed to fetch activity logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // Listen for new logs
    // @ts-ignore
    const cleanup = window.api.activity.onLog((log: ActivityEvent) => {
      setLogs(prev => [log, ...prev]);
    });
    return cleanup;
  }, []);

  const filteredLogs = logs.filter(l => 
    l.description.toLowerCase().includes(filter.toLowerCase()) || 
    l.type.toLowerCase().includes(filter.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    if (type.includes('error')) return <AlertTriangle size={14} color="#ef4444" />;
    if (type.includes('permission') || type.includes('credential')) return <Shield size={14} color="#f59e0b" />;
    if (type.includes('agent')) return <Bot size={14} color="#a855f7" />;
    if (type.includes('file')) return <FileText size={14} color="#3b82f6" />;
    return <Terminal size={14} color="#94a3b8" />;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-background)', overflow: 'hidden' }}>
      <div style={{ padding: 24, borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Activity size={20} color="#ffffff" />
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#ffffff' }}>Activity Center</h2>
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: 0 }}>System-wide audit logs and agent actions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--color-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)',
                borderRadius: 8, padding: '6px 12px 6px 32px', color: '#fff', fontSize: 12,
                outline: 'none', width: 220
              }}
            />
          </div>
          <button 
            onClick={fetchLogs}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', 
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', 
              borderRadius: 8, color: '#fff', fontSize: 12, cursor: 'pointer' 
            }}
          >
            <RefreshCw size={14} className={loading ? "spinning" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {loading && logs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 40, fontSize: 13 }}>Loading activity logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 40, fontSize: 13 }}>No activity recorded yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filteredLogs.map(log => (
              <div key={log.id} style={{ 
                display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', 
                background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' 
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getTypeIcon(log.type)}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{log.description}</span>
                    <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '2px 6px', borderRadius: 4 }}>
                      {log.type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--color-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={10} /> {new Date(log.created_at).toLocaleString()}
                    </span>
                    {log.agent_id && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Bot size={10} /> Agent: {log.agent_id.substring(0,8)}...
                      </span>
                    )}
                    {log.task_id && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Terminal size={10} /> Task: {log.task_id.substring(0,8)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { PlayCircle, Plus, Trash2, Clock, CheckCircle2, Play, Pause, Activity } from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  triggerConfig: string;
  targetIntent: string;
  status: string; // 'active' | 'paused'
  lastRunAt: number | null;
  createdAt: number;
}

export function AutomationsView() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [addMode, setAddMode] = useState(false);
  const [newAuto, setNewAuto] = useState({ name: '', description: '', triggerType: 'cron', triggerConfig: '0 9 * * *', targetIntent: '' });

  const loadAutomations = async () => {
    try {
      // @ts-ignore
      const data = await window.api.automations.list();
      setAutomations(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAutomations();
    const interval = setInterval(loadAutomations, 10000); // refresh UI periodically
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (id: string, active: boolean) => {
    // @ts-ignore
    await window.api.automations.toggle(id, active);
    await loadAutomations();
  };

  const handleDelete = async (id: string) => {
    // @ts-ignore
    await window.api.automations.delete(id);
    await loadAutomations();
  };

  const handleCreate = async () => {
    if (!newAuto.name || !newAuto.targetIntent) return;
    // @ts-ignore
    await window.api.automations.create(newAuto);
    setAddMode(false);
    setNewAuto({ name: '', description: '', triggerType: 'cron', triggerConfig: '0 9 * * *', targetIntent: '' });
    await loadAutomations();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#000000', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ padding: '40px 40px 0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Clock size={24} color="rgba(255,255,255,0.8)" /> Automations
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              Configure background jobs and scheduled workflows to run autonomously.
            </p>
          </div>
          <button onClick={() => setAddMode(true)} style={{ ...btnStyle, background: '#ffffff', color: '#000000', fontWeight: 600 }}>
            <Plus size={14} /> New Automation
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 40px 40px 40px' }}>
        
        {addMode && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#ffffff' }}>Create New Automation</h2>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>NAME</label>
                <input value={newAuto.name} onChange={e => setNewAuto({...newAuto, name: e.target.value})} placeholder="e.g. Daily Standup Prep" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>CRON SCHEDULE</label>
                <input value={newAuto.triggerConfig} onChange={e => setNewAuto({...newAuto, triggerConfig: e.target.value})} placeholder="0 9 * * *" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>DESCRIPTION</label>
              <input value={newAuto.description} onChange={e => setNewAuto({...newAuto, description: e.target.value})} placeholder="Brief description of what this does" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>TARGET INTENT (NATURAL LANGUAGE)</label>
              <textarea value={newAuto.targetIntent} onChange={e => setNewAuto({...newAuto, targetIntent: e.target.value})} placeholder="e.g. Read the last 5 PRs and summarize them for my standup." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setAddMode(false)} style={btnStyle}>Cancel</button>
              <button onClick={handleCreate} style={{ ...btnStyle, background: '#ffffff', color: '#000000', fontWeight: 600 }}>Save Automation</button>
            </div>
          </div>
        )}

        {automations.length === 0 && !addMode ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>
            <Activity size={32} style={{ opacity: 0.5, marginBottom: 16 }} />
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: '#ffffff' }}>No Active Automations</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Set up cron jobs to run workflows automatically.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {automations.map(auto => (
              <div key={auto.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#ffffff' }}>{auto.name}</h3>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: auto.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.1)', color: auto.status === 'active' ? '#22c55e' : 'rgba(255,255,255,0.5)' }}>
                        {auto.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{auto.description}</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => handleToggle(auto.id, auto.status !== 'active')}
                      style={{ ...btnStyle, background: auto.status === 'active' ? 'rgba(255,255,255,0.1)' : '#ffffff', color: auto.status === 'active' ? '#ffffff' : '#000000' }}
                    >
                      {auto.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                      {auto.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                    <button onClick={() => handleDelete(auto.id)} style={{ ...btnStyle, background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 24, padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div>
                    <div style={statLabel}>TRIGGER</div>
                    <div style={statValue}><Clock size={12} /> {auto.triggerType.toUpperCase()} : {auto.triggerConfig}</div>
                  </div>
                  <div>
                    <div style={statLabel}>LAST RUN</div>
                    <div style={statValue}>
                      {auto.lastRunAt ? new Date(auto.lastRunAt).toLocaleString() : 'Never'}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={statLabel}>TARGET INTENT</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontStyle: 'italic' }}>
                    "{auto.targetIntent}"
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#ffffff', padding: '12px 16px', borderRadius: 8, fontSize: 14, outline: 'none',
  fontFamily: 'inherit'
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
  marginBottom: 8, letterSpacing: '0.05em'
};

const btnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  background: 'rgba(255,255,255,0.05)', border: 'none',
  color: '#ffffff', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
};

const statLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginBottom: 4
};
const statValue: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6
};

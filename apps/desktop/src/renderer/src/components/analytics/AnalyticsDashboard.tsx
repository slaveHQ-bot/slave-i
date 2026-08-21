import React, { useEffect, useState } from 'react';
import { Activity, BarChart2, Clock, DollarSign, Zap } from 'lucide-react';

interface Stats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  runningTasks: number;
  totalTokens: number;
  estimatedCostUsd: number;
  byModel: Record<string, { tokens: number; cost: number; requests: number }>;
  recentTasks: Array<{ id: string; objective: string; status: string; createdAt: string; metadata?: string }>;
}

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: React.FC<any>; color: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sub}</div>}
    </div>
  );
}

function ModelBar({ model, tokens, maxTokens, cost }: { model: string; tokens: number; maxTokens: number; cost: number }) {
  const pct = maxTokens > 0 ? (tokens / maxTokens) * 100 : 0;
  const short = model.length > 28 ? model.slice(0, 28) + '…' : model;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: '#ffffff', fontFamily: 'monospace' }}>{short}</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{tokens.toLocaleString()} tok · ${cost.toFixed(4)}</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: 'linear-gradient(90deg, #ffffff, #e5e5e5)', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  completed: '#ffffff',
  running:   '#e5e5e5',
  failed:    '#ffffff',
  pending:   '#cccccc',
};

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data = await window.electron?.ipcRenderer?.invoke('analytics.getStats');
      if (data) setStats(data);
    } catch (_e) {}
    setLoading(false);
  };

  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, []);

  if (loading && !stats) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
        Loading analytics…
      </div>
    );
  }

  const s = stats ?? { totalTasks: 0, completedTasks: 0, failedTasks: 0, runningTasks: 0, totalTokens: 0, estimatedCostUsd: 0, byModel: {}, recentTasks: [] };
  const maxTokens = Math.max(...Object.values(s.byModel).map(m => m.tokens), 1);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <BarChart2 size={18} color="#ffffff" />
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 }}>Analytics</h2>
        <button onClick={load} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Tasks"     value={String(s.totalTasks)}     sub={`${s.runningTasks} running`}   icon={Activity}     color="#e5e5e5" />
        <StatCard label="Completed"       value={String(s.completedTasks)}  sub={`${s.failedTasks} failed`}     icon={Zap}          color="#ffffff" />
        <StatCard label="Total Tokens"    value={s.totalTokens.toLocaleString()} sub="This session"           icon={BarChart2}    color="#ffffff" />
        <StatCard label="Est. Cost"       value={`$${s.estimatedCostUsd.toFixed(4)}`} sub="This session"      icon={DollarSign}   color="#cccccc" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Model usage bars */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: '0 0 16px' }}>Token Usage by Model</h3>
          {Object.keys(s.byModel).length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, textAlign: 'center', padding: 24 }}>No data yet</div>
          ) : (
            Object.entries(s.byModel).map(([model, d]) => (
              <ModelBar key={model} model={model} tokens={d.tokens} maxTokens={maxTokens} cost={d.cost} />
            ))
          )}
        </div>

        {/* Status breakdown */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: '0 0 16px' }}>Task Status Breakdown</h3>
          {[
            { label: 'Completed', value: s.completedTasks, color: '#ffffff' },
            { label: 'Running',   value: s.runningTasks,   color: '#e5e5e5' },
            { label: 'Failed',    value: s.failedTasks,    color: '#ffffff' },
            { label: 'Pending',   value: Math.max(0, s.totalTasks - s.completedTasks - s.runningTasks - s.failedTasks), color: '#cccccc' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', flex: 1 }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent tasks */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={13} /> Recent Tasks
        </h3>
        {s.recentTasks.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, textAlign: 'center', padding: 24 }}>No tasks yet</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Objective', 'Status', 'Created'].map(h => (
                  <th key={h} style={{ textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontWeight: 500, padding: '4px 8px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.recentTasks.slice(0, 20).map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 8px', color: '#ffffff', maxWidth: 280 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.objective || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '8px 8px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: `${STATUS_COLOR[task.status] ?? '#888'}18`, color: STATUS_COLOR[task.status] ?? '#888' }}>
                      {task.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '8px 8px', color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(task.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

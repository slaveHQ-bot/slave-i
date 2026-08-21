import React, { useMemo, useState } from 'react';
import { Bot, Search, Zap, Plus, Edit2 } from 'lucide-react';
import { AgentBuilder } from './AgentBuilder';

const TIER_COLORS: Record<number, string> = { 1: '#ffffff', 2: '#cccccc', 3: '#e5e5e5', 4: '#ffffff' };
const TIER_LABELS: Record<number, string> = { 1: 'Tier 1 · Elite', 2: 'Tier 2 · Senior', 3: 'Tier 3 · Standard', 4: 'Tier 4 · Specialist' };

interface Agent {
  id: string;
  name: string;
  description?: string;
  tier?: number;
  status?: string;
  currentTask?: string;
}

interface Props {
  agents: Agent[];
  activeSlaves: Set<string>;
  slaveMeta: Record<string, { icon: React.FC<any>; tier: number; color: string }>;
  onAgentClick?: (id: string) => void;
}

export function AgentWorkforceView({ agents, activeSlaves, slaveMeta, onAgentClick }: Props) {
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [localAgents, setLocalAgents] = useState(agents);
  
  const handleSaveAgent = async (agentData: any) => {
    // @ts-ignore
    await window.api.saveAgent(agentData);
    // @ts-ignore
    const updatedAgents = await window.api.getAgents();
    setLocalAgents(updatedAgents);
    setShowBuilder(false);
  };
  
  if (showBuilder) {
    return <AgentBuilder onClose={() => setShowBuilder(false)} onSave={handleSaveAgent} initialData={null} />;
  }

  const filtered = useMemo(() => localAgents.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                        (a.description ?? '').toLowerCase().includes(search.toLowerCase());
    const meta = slaveMeta[a.id];
    const tier = meta?.tier ?? 3;
    const matchTier = filterTier === null || tier === filterTier;
    return matchSearch && matchTier;
  }), [agents, search, filterTier, slaveMeta]);

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Main panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Bot size={18} color="#ffffff" />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 }}>Slave Workforce</h2>
          <span style={{ marginLeft: 4, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{agents.length} agents registered</span>
          <span style={{ marginLeft: 4, fontSize: 12, color: '#ffffff' }}>{activeSlaves.size} active</span>
          
          <button 
            onClick={() => setShowBuilder(true)}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--color-primary)', color: 'var(--color-background)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            <Plus size={14} /> New Agent
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search agents…"
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 30, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', padding: '7px 12px 7px 30px', borderRadius: 8, fontSize: 12, outline: 'none' }}
            />
          </div>
          {[null, 1, 2, 3, 4].map(tier => (
            <button
              key={String(tier)}
              onClick={() => setFilterTier(tier)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12,
                background: filterTier === tier ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                color: filterTier === tier ? '#ffffff' : 'rgba(255,255,255,0.5)',
              }}
            >
              {tier === null ? 'All' : `T${tier}`}
            </button>
          ))}
        </div>

        {/* Agent grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {filtered.map(agent => {
            const meta = slaveMeta[agent.id] ?? { icon: Bot, tier: 3, color: '#cccccc' };
            const Icon = meta.icon;
            const isActive = activeSlaves.has(agent.id);
            const tierColor = TIER_COLORS[meta.tier] ?? '#888';

            return (
              <div
                key={agent.id}
                onClick={() => onAgentClick?.(agent.id)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: 16, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${meta.color}30` }}>
                    <Icon size={18} color={meta.color} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? '#ffffff' : 'rgba(255,255,255,0.2)', boxShadow: isActive ? '0 0 6px #ffffff' : 'none' }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: tierColor, background: `${tierColor}18`, padding: '1px 5px', borderRadius: 4 }}>T{meta.tier}</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>
                  {agent.name.replace(' Slave', '')}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                  {(agent.description ?? 'Specialized AI agent').slice(0, 60)}
                </div>
                {isActive && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#ffffff' }}>
                    <Zap size={10} />
                    Active
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
              No agents found
            </div>
          )}
        </div>
      </div>

      {/* Removed local detail panel in favor of global RightPanel */}
    </div>
  );
}

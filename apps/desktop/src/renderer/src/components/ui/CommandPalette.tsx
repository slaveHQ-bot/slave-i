import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BarChart2, Bot, Brain, GitBranch, Globe, Plus, Search,
  Settings, Terminal, Trash2, X, Zap,
} from 'lucide-react';

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.FC<any>;
  action: () => void;
  keywords?: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}

function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function CommandPalette({ open, onClose, commands }: Props) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter(cmd => {
    const haystack = `${cmd.label} ${cmd.description ?? ''} ${(cmd.keywords ?? []).join(' ')}`;
    return fuzzyMatch(query, haystack);
  });

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const execute = useCallback((cmd: Command) => {
    cmd.action();
    onClose();
  }, [onClose]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[selectedIdx]) { execute(filtered[selectedIdx]); }
    if (e.key === 'Escape') onClose();
  }, [filtered, selectedIdx, execute, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 120,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 620, maxHeight: 480,
          background: 'rgba(10,14,24,0.97)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Search size={16} color="rgba(255,255,255,0.4)" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search commands…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 15, color: '#ffffff', fontFamily: 'inherit',
            }}
          />
          <kbd style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.07)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ overflowY: 'auto', maxHeight: 380 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              No commands found
            </div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              const isSelected = i === selectedIdx;
              return (
                <div
                  key={cmd.id}
                  onClick={() => execute(cmd)}
                  onMouseEnter={() => setSelectedIdx(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 16px', cursor: 'pointer',
                    background: isSelected ? 'rgba(168,85,247,0.12)' : 'transparent',
                    borderLeft: isSelected ? '2px solid #ffffff' : '2px solid transparent',
                    transition: 'all 0.1s',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: isSelected ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={14} color={isSelected ? '#ffffff' : 'rgba(255,255,255,0.5)'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)' }}>
                      {cmd.label}
                    </div>
                    {cmd.description && (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                        {cmd.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 16 }}>
          {[['↑↓', 'Navigate'], ['↵', 'Select'], ['ESC', 'Close']].map(([key, label]) => (
            <span key={key} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              <kbd style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', marginRight: 4 }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper: build the default command list
export function buildCommands(actions: {
  newChat: () => void;
  clearChat: () => void;
  openSettings: () => void;
  setView: (v: string) => void;
  onSelectAgent: (id: string) => void;
  onSelectTask: (id: string) => void;
}, agents: any[] = [], activeTasks: any[] = []): Command[] {
  const baseCommands: Command[] = [
    { id: 'new-chat',      label: 'New Chat',            description: 'Start a fresh conversation',  icon: Plus,      action: actions.newChat,                       keywords: ['new', 'chat', 'start'] },
    { id: 'clear',         label: 'Clear Chat',           description: 'Erase messages in this chat', icon: Trash2,    action: actions.clearChat,                     keywords: ['clear', 'erase', 'reset'] },
    { id: 'settings',      label: 'Open Settings',        description: 'Configure providers, models', icon: Settings,  action: actions.openSettings,                  keywords: ['settings', 'config', 'preferences'] },
    { id: 'view-chat',     label: 'Go to Command View',   description: 'Switch to the chat panel',    icon: Terminal,  action: () => actions.setView('chat'),         keywords: ['chat', 'command'] },
    { id: 'view-tasks',    label: 'Go to Task Graph',     description: 'View running tasks',          icon: GitBranch, action: () => actions.setView('tasks'),        keywords: ['tasks', 'graph', 'dag'] },
    { id: 'view-agents',   label: 'Go to Workforce',      description: 'Manage your slave agents',    icon: Bot,       action: () => actions.setView('agents'),       keywords: ['agents', 'workforce', 'slaves'] },
    { id: 'view-browser',  label: 'Go to Browser',        description: 'Browser workspace',           icon: Globe,     action: () => actions.setView('browser'),      keywords: ['browser', 'web', 'internet'] },
    { id: 'view-files',    label: 'Go to Files',          description: 'Manage files',                icon: Zap,       action: () => actions.setView('files'),        keywords: ['files', 'documents'] },
    { id: 'view-automations', label: 'Go to Automations', description: 'Scheduled tasks',             icon: Zap,       action: () => actions.setView('automations'),  keywords: ['automations', 'cron', 'schedule'] },
    { id: 'view-mcp',      label: 'Go to MCP',            description: 'Model Context Protocol',      icon: Zap,       action: () => actions.setView('mcp'),          keywords: ['mcp', 'servers', 'tools'] },
    { id: 'view-connections', label: 'Go to Connections', description: 'Manage integrations',         icon: Zap,       action: () => actions.setView('connections'),  keywords: ['connections', 'integrations', 'auth'] },
    { id: 'view-memory',   label: 'Go to Memory',         description: 'Browse stored memories',      icon: Brain,     action: () => actions.setView('memory'),       keywords: ['memory', 'context'] },
    { id: 'view-network',  label: 'Go to Network',        description: 'View swarm connections',      icon: Globe,     action: () => actions.setView('network'),      keywords: ['network', 'swarm', 'nodes'] },
    { id: 'view-analytics',label: 'Go to Analytics',      description: 'Token usage and costs',       icon: BarChart2, action: () => actions.setView('analytics'),   keywords: ['analytics', 'usage', 'cost', 'tokens'] },
    { id: 'view-projects', label: 'Go to Projects',       description: 'Manage your projects',        icon: Zap,       action: () => actions.setView('projects'),     keywords: ['projects', 'workspace'] },
  ];

  const agentCommands: Command[] = agents.map(a => ({
    id: `agent-${a.id}`,
    label: `Agent: ${a.name}`,
    description: a.description || 'View agent context',
    icon: Bot,
    action: () => actions.onSelectAgent(a.id),
    keywords: ['agent', 'slave', a.id, ...(a.description?.split(' ') || [])]
  }));

  const taskCommands: Command[] = activeTasks.map(t => ({
    id: `task-${t.id}`,
    label: `Task: ${t.objective?.slice(0, 40) || t.id}`,
    description: 'View task details',
    icon: GitBranch,
    action: () => actions.onSelectTask(t.id),
    keywords: ['task', 'job', 'execution', t.id, ...(t.objective?.split(' ') || [])]
  }));

  return [...baseCommands, ...agentCommands, ...taskCommands];
}

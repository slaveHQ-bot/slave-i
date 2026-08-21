import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Terminal, Wrench, Database, MessageSquare, Shield, Activity, Settings, Save, Trash2 } from 'lucide-react';

interface McpServer {
  id: string;
  name: string;
  type: string;
  command?: string;
  args?: string;
  env?: string;
  url?: string;
  status: string;
  capabilities: string; // JSON
}

interface McpServerDetailProps {
  server: McpServer | null;
  onBack: () => void;
  onSave: (server: Partial<McpServer>) => void;
  onDelete: (id: string) => void;
}

type TabType = 'Configuration' | 'Tools' | 'Resources' | 'Prompts' | 'Permissions' | 'Logs' | 'Status';

export const McpServerDetail: React.FC<McpServerDetailProps> = ({ server, onBack, onSave, onDelete }) => {
  const isNew = !server;
  const [activeTab, setActiveTab] = useState<TabType>('Configuration');
  const [formData, setFormData] = useState<Partial<McpServer>>(server || {
    name: '',
    type: 'local',
    command: '',
    args: '[]',
    env: '{}',
    url: '',
    status: 'disconnected',
    capabilities: '{"tools":[],"resources":[],"prompts":[]}'
  });

  const capabilities = JSON.parse(formData.capabilities || '{"tools":[],"resources":[],"prompts":[]}');

  const tabs: { id: TabType; icon: React.ReactNode }[] = [
    { id: 'Configuration', icon: <Settings size={14} /> },
    { id: 'Tools', icon: <Wrench size={14} /> },
    { id: 'Resources', icon: <Database size={14} /> },
    { id: 'Prompts', icon: <MessageSquare size={14} /> },
    { id: 'Permissions', icon: <Shield size={14} /> },
    { id: 'Status', icon: <CheckCircle2 size={14} /> },
    { id: 'Logs', icon: <Terminal size={14} /> }
  ];

  return (
    <div style={{ padding: 40, height: '100%', overflowY: 'auto', background: '#000000', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <button 
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 24, fontSize: 13 }}>
        <ArrowLeft size={16} /> Back to MCP Servers
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {isNew ? 'Configure New MCP Server' : formData.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, padding: '4px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: 20 }}>
              {formData.type === 'local' ? 'Local Stdio' : 'Remote SSE'}
            </span>
            {!isNew && (
              <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: formData.status === 'connected' ? '#22c55e' : '#ef4444' }}>
                {formData.status === 'connected' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {formData.status === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {!isNew && (
            <button 
              onClick={() => onDelete(formData.id!)}
              style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
              <Trash2 size={14} /> Remove
            </button>
          )}
          <button 
            onClick={() => onSave(formData)}
            style={{ padding: '8px 16px', borderRadius: 8, background: '#ffffff', color: '#000000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <Save size={14} /> Save Configuration
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 32, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid #ffffff' : '2px solid transparent',
              color: activeTab === t.id ? '#ffffff' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}>
            {t.icon} {t.id}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 800 }}>
        {activeTab === 'Configuration' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>SERVER NAME</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Github MCP, Local Filesystem..."
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ffffff', fontSize: 14 }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>TRANSPORT TYPE</label>
              <select 
                value={formData.type}
                onChange={e => setFormData(f => ({ ...f, type: e.target.value }))}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ffffff', fontSize: 14 }}>
                <option value="local">Local Stdio (spawn process)</option>
                <option value="remote">Remote SSE (URL)</option>
              </select>
            </div>

            {formData.type === 'local' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>COMMAND</label>
                  <input 
                    type="text" 
                    value={formData.command}
                    onChange={e => setFormData(f => ({ ...f, command: e.target.value }))}
                    placeholder="e.g. npx, python, node..."
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ffffff', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>ARGUMENTS (JSON Array)</label>
                  <input 
                    type="text" 
                    value={formData.args}
                    onChange={e => setFormData(f => ({ ...f, args: e.target.value }))}
                    placeholder='e.g. ["-y", "@modelcontextprotocol/server-github"]'
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ffffff', fontSize: 14, fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>ENVIRONMENT VARIABLES (JSON Object)</label>
                  <textarea 
                    value={formData.env}
                    onChange={e => setFormData(f => ({ ...f, env: e.target.value }))}
                    placeholder='{"GITHUB_TOKEN": "..."}'
                    rows={4}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ffffff', fontSize: 14, fontFamily: 'monospace', resize: 'vertical' }}
                  />
                </div>
              </>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>SSE URL</label>
                <input 
                  type="text" 
                  value={formData.url}
                  onChange={e => setFormData(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://mcp.example.com/sse"
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#ffffff', fontSize: 14 }}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'Tools' && (
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Available Tools</h3>
            {capabilities.tools.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 12, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                No tools exposed by this server. Connect to discover capabilities.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {capabilities.tools.map((tool: any, idx: number) => (
                  <div key={idx} style={{ padding: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{tool.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{tool.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Similar stubs for Resources, Prompts, Permissions, Logs, Status */}
        {['Resources', 'Prompts', 'Permissions', 'Logs', 'Status'].includes(activeTab) && (
          <div style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 12, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            <Activity size={32} style={{ opacity: 0.5, marginBottom: 16 }} />
            <div>This section will populate when the MCP server is actively connected.</div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState, useMemo } from 'react';
import { Download, Package, Search, Trash2, X, Shield, Link2, Code, Zap, Globe, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  version: string;
  publisher: string;
  capabilities: string;
  permissions: string;
  tools: string;
  connections: string;
  status: string; // 'installed' | 'disabled' | 'error'
  createdAt: number;
  updatedAt: number;
}

export function PluginMarketplace() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [activeTab, setActiveTab] = useState<'Installed' | 'Marketplace' | 'Updates' | 'Developer'>('Installed');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Plugin | null>(null);

  const loadPlugins = async () => {
    try {
      // @ts-ignore
      const data = await window.api.plugins.list();
      setPlugins(data);
      if (selected) {
        const updated = data.find((p: Plugin) => p.id === selected.id);
        setSelected(updated || null);
      }
    } catch (e) {
      console.error('Failed to load plugins:', e);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  const filtered = useMemo(() => {
    return plugins.filter(p => {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.publisher.toLowerCase().includes(q);
    });
  }, [plugins, search]);

  const togglePlugin = async (id: string, currentlyEnabled: boolean) => {
    // @ts-ignore
    await window.api.plugins.toggle(id, !currentlyEnabled);
    await loadPlugins();
  };

  const uninstallPlugin = async (id: string) => {
    // @ts-ignore
    await window.api.plugins.uninstall(id);
    await loadPlugins();
    setSelected(null);
  };

  const mockInstallDev = async () => {
    // Mock installing a local dev plugin to test the system
    const mockManifest = {
      name: 'Developer Toolkit',
      version: '1.0.0',
      publisher: 'slavelabs',
      capabilities: ['file_system', 'shell_exec'],
      permissions: ['read:workspace', 'write:workspace', 'run:commands'],
      tools: [{ name: 'grep_search', description: 'Search files' }],
      connections: ['github']
    };
    // @ts-ignore
    await window.api.plugins.install(mockManifest);
    // As it's just a mock endpoint, we will simulate the DB insertion by just refreshing (which does nothing for mock right now, but in a real app would load it)
    await loadPlugins();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#000000', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '40px 40px 0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Package size={24} color="rgba(255,255,255,0.8)" /> Plugin Marketplace
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              Extend Slave OS with custom tools, external connections, and dynamic capabilities.
            </p>
          </div>
          <button onClick={loadPlugins} style={btnStyle}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 24 }}>
          {['Installed', 'Marketplace', 'Updates', 'Developer'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: '12px 24px', background: 'none', border: 'none',
                borderBottom: activeTab === tab ? '2px solid #ffffff' : '2px solid transparent',
                color: activeTab === tab ? '#ffffff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 40px 40px 40px', overflowY: 'auto' }}>
          
          {(activeTab === 'Marketplace' || activeTab === 'Updates') && (
            <div style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Globe size={32} style={{ opacity: 0.5, marginBottom: 16 }} />
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: '#ffffff' }}>Online Registry Coming Soon</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>The public plugin repository is currently under construction.</div>
            </div>
          )}

          {activeTab === 'Developer' && (
            <div style={{ padding: 40, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Zap size={32} style={{ opacity: 0.5, marginBottom: 16 }} />
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: '#ffffff' }}>Developer Mode</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Load local plugins from your filesystem to test before publishing.</div>
              <button onClick={mockInstallDev} style={{ ...btnStyle, background: '#ffffff', color: '#000000', padding: '12px 24px' }}>
                Load Local Plugin...
              </button>
            </div>
          )}

          {activeTab === 'Installed' && (
            <>
              {/* Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0 16px', marginBottom: 24, maxWidth: 400 }}>
                <Search size={16} color="rgba(255,255,255,0.4)" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search installed plugins..."
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', padding: '12px 0', width: '100%', fontSize: 14 }}
                />
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.4)' }}>
                  No plugins installed. Check the Developer tab to load a local plugin.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {filtered.map(plugin => (
                    <div
                      key={plugin.id}
                      onClick={() => setSelected(plugin)}
                      style={{
                        background: selected?.id === plugin.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${selected?.id === plugin.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'all 0.15s', position: 'relative'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = selected?.id === plugin.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={20} color="#ffffff" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: plugin.status === 'installed' ? '#22c55e' : '#ef4444' }}>
                          {plugin.status === 'installed' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {plugin.status === 'installed' ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>{plugin.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>v{plugin.version} · by {plugin.publisher}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ width: 380, borderLeft: '1px solid rgba(255,255,255,0.1)', background: '#000000', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={24} color="#ffffff" />
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0' }}>{selected.name}</h2>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>v{selected.version} · by {selected.publisher}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button 
                  onClick={() => togglePlugin(selected.id, selected.status === 'installed')} 
                  style={{ ...actionBtn, background: selected.status === 'installed' ? 'rgba(255,255,255,0.1)' : '#ffffff', color: selected.status === 'installed' ? '#ffffff' : '#000000' }}
                >
                  {selected.status === 'installed' ? 'Disable Plugin' : 'Enable Plugin'}
                </button>
                <button onClick={() => uninstallPlugin(selected.id)} style={{ ...actionBtn, background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <Trash2 size={14} /> Uninstall
                </button>
              </div>
            </div>

            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginBottom: 12, textTransform: 'uppercase' }}>Capabilities</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
                {JSON.parse(selected.capabilities || '[]').map((cap: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#ffffff', background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: 8 }}>
                    <Zap size={14} color="rgba(255,255,255,0.5)" /> {cap}
                  </div>
                ))}
                {JSON.parse(selected.capabilities || '[]').length === 0 && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>None</div>}
              </div>

              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginBottom: 12, textTransform: 'uppercase' }}>Permissions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
                {JSON.parse(selected.permissions || '[]').map((perm: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#ffffff', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 12px', borderRadius: 8 }}>
                    <Shield size={14} color="#ef4444" /> {perm}
                  </div>
                ))}
                {JSON.parse(selected.permissions || '[]').length === 0 && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>None required</div>}
              </div>

              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginBottom: 12, textTransform: 'uppercase' }}>External Connections</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
                {JSON.parse(selected.connections || '[]').map((conn: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#ffffff', background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: 8 }}>
                    <Link2 size={14} color="rgba(255,255,255,0.5)" /> {conn}
                  </div>
                ))}
                {JSON.parse(selected.connections || '[]').length === 0 && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>None</div>}
              </div>

              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', marginBottom: 12, textTransform: 'uppercase' }}>Tools Injected</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {JSON.parse(selected.tools || '[]').map((tool: any, i: number) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
                      <Code size={12} /> {tool.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{tool.description}</div>
                  </div>
                ))}
                {JSON.parse(selected.tools || '[]').length === 0 && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>None</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  background: 'rgba(255,255,255,0.05)', border: 'none',
  color: '#ffffff', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
};

const actionBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  width: '100%', padding: '12px 0', borderRadius: 8, border: 'none',
  cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s'
};

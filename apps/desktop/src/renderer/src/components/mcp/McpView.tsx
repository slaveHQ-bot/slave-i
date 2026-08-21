import React, { useState, useEffect, useMemo } from 'react';
import { Database, Plus, Search, Terminal, Globe, Server, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { McpServerDetail } from './McpServerDetail';

interface McpServer {
  id: string;
  name: string;
  type: string;
  command?: string;
  args?: string;
  env?: string;
  url?: string;
  status: string;
  capabilities: string;
}

export const McpView: React.FC = () => {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<McpServer | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'Installed' | 'Available' | 'Local' | 'Remote'>('Installed');
  const [search, setSearch] = useState('');

  const loadServers = async () => {
    try {
      // @ts-ignore
      const data = await window.api.mcp.listServers();
      setServers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  const handleSave = async (serverData: Partial<McpServer>) => {
    try {
      // @ts-ignore
      await window.api.mcp.addServer(serverData);
      await loadServers();
      setShowDetail(false);
      setSelectedServer(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // @ts-ignore
      await window.api.mcp.removeServer(id);
      await loadServers();
      setShowDetail(false);
      setSelectedServer(null);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredServers = useMemo(() => {
    return servers.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      let matchTab = true;
      if (activeTab === 'Local') matchTab = s.type === 'local';
      if (activeTab === 'Remote') matchTab = s.type === 'remote';
      // 'Available' could be an online marketplace in the future. For now, it's empty.
      if (activeTab === 'Available') return false; 
      return matchSearch && matchTab;
    });
  }, [servers, search, activeTab]);

  if (showDetail) {
    return (
      <McpServerDetail 
        server={selectedServer}
        onBack={() => { setShowDetail(false); setSelectedServer(null); }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000000', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ padding: '40px 40px 0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Database size={24} color="rgba(255,255,255,0.8)" /> Model Context Protocol
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              Manage external tools, resources, and connections for Slave agents.
            </p>
          </div>
          <button 
            onClick={() => { setSelectedServer(null); setShowDetail(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, background: '#ffffff', color: '#000000', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <Plus size={16} /> Add Server
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 24 }}>
          {['Installed', 'Available', 'Local', 'Remote'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: '12px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #ffffff' : '2px solid transparent',
                color: activeTab === tab ? '#ffffff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.2s'
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0 16px', marginBottom: 24, maxWidth: 400 }}>
          <Search size={16} color="rgba(255,255,255,0.4)" />
          <input 
            type="text" 
            placeholder="Search MCP servers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', padding: '12px 0', width: '100%', fontSize: 14 }}
          />
        </div>
      </div>

      {/* Grid List */}
      <div style={{ padding: '0 40px 40px 40px', overflowY: 'auto', flex: 1 }}>
        {activeTab === 'Available' ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Server size={32} style={{ opacity: 0.5, marginBottom: 16 }} />
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: '#ffffff' }}>Marketplace coming soon</div>
            <div style={{ fontSize: 13 }}>For now, use "Add Server" to configure local and remote MCPs manually.</div>
          </div>
        ) : filteredServers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            No servers found.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filteredServers.map(server => {
              const caps = JSON.parse(server.capabilities || '{"tools":[],"resources":[],"prompts":[]}');
              
              return (
                <div 
                  key={server.id}
                  onClick={() => { setSelectedServer(server); setShowDetail(true); }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: 20,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {server.type === 'local' ? <Terminal size={20} color="#ffffff" /> : <Globe size={20} color="#ffffff" />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: server.status === 'connected' ? '#22c55e' : '#ef4444' }}>
                      {server.status === 'connected' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {server.status === 'connected' ? 'Ready' : 'Offline'}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>{server.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
                    {server.type === 'local' ? `Local: ${server.command}` : `Remote: ${server.url}`}
                  </div>
                  
                  <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                      <strong style={{ color: '#ffffff' }}>{caps.tools?.length || 0}</strong> Tools
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                      <strong style={{ color: '#ffffff' }}>{caps.resources?.length || 0}</strong> Resources
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

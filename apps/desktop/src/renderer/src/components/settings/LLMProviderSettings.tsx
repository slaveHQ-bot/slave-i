import React, { useState, useEffect } from 'react';
import { X, Check, RefreshCw, Trash2, Plus, Server, ChevronUp, ChevronDown } from 'lucide-react';

export const LLMProviderSettings = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newProviderType, setNewProviderType] = useState('openai');
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderBaseUrl, setNewProviderBaseUrl] = useState('');
  const [newProviderKey, setNewProviderKey] = useState('');

  const loadData = async () => {
    const provs = await (window as any).electron.ipcRenderer.invoke('llm.providers.list');
    setProviders(provs || []);
    const mods = await (window as any).electron.ipcRenderer.invoke('llm.models.list');
    setModels(mods || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async () => {
    const meta = {
      id: `prov_${Date.now()}`,
      type: newProviderType,
      name: newProviderName || newProviderType.toUpperCase(),
      enabled: true,
      priority: providers.length,
      baseUrl: newProviderBaseUrl || undefined,
    };
    
    await (window as any).electron.ipcRenderer.invoke('llm.providers.add', meta, newProviderKey);
    setShowAdd(false);
    setNewProviderKey('');
    setNewProviderBaseUrl('');
    loadData();
  };

  const handleTest = async (id: string) => {
    const res = await (window as any).electron.ipcRenderer.invoke('llm.providers.test', id);
    if (res.success) {
      alert('Connection successful!');
    } else {
      alert('Connection failed: ' + res.message);
    }
  };

  const handleRefresh = async (id: string) => {
    await (window as any).electron.ipcRenderer.invoke('llm.models.refresh', id);
    alert('Models refreshed!');
    loadData();
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === providers.length - 1) return;

    const newProviders = [...providers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap priorities
    const currentPriority = newProviders[index].priority || index;
    const targetPriority = newProviders[targetIndex].priority || targetIndex;

    await (window as any).electron.ipcRenderer.invoke('llm.providers.setPriority', newProviders[index].id, targetPriority);
    await (window as any).electron.ipcRenderer.invoke('llm.providers.setPriority', newProviders[targetIndex].id, currentPriority);
    
    loadData();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button 
          onClick={() => setShowAdd(true)}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#ffffff', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        >
          <Plus size={14} /> Add Provider
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>Provider Type</label>
            <select 
              value={newProviderType} 
              onChange={e => setNewProviderType(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: 8, borderRadius: 6 }}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google Gemini</option>
              <option value="xai">xAI (Grok)</option>
              <option value="mistral">Mistral AI</option>
              <option value="groq">Groq</option>
              <option value="together">Together AI</option>
              <option value="deepseek">DeepSeek</option>
              <option value="cohere">Cohere</option>
              <option value="perplexity">Perplexity</option>
              <option value="openrouter">OpenRouter</option>
              <option value="ollama">Ollama</option>
              <option value="lmstudio">LM Studio</option>
              <option value="local">Local Model</option>
              <option value="custom">Custom (OpenAI-Compatible)</option>
            </select>
          </div>
          
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>Display Name</label>
            <input 
              value={newProviderName} onChange={e => setNewProviderName(e.target.value)} placeholder="e.g. My Local AI"
              style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: 8, borderRadius: 6 }}
            />
          </div>

          {['custom', 'local', 'lmstudio', 'xai', 'mistral', 'together', 'cohere', 'perplexity'].includes(newProviderType) && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>Base URL</label>
              <input 
                value={newProviderBaseUrl} onChange={e => setNewProviderBaseUrl(e.target.value)} placeholder="Leave blank for default"
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: 8, borderRadius: 6 }}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>API Key / Token</label>
            <input 
              type="password" value={newProviderKey} onChange={e => setNewProviderKey(e.target.value)} placeholder="Stored securely in DB"
              style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: 8, borderRadius: 6 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleAdd} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Save Provider</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {providers.map((p, index) => {
          const providerModels = models.filter(m => m.providerId === p.id);
          return (
          <div key={p.id} style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10, opacity: p.enabled ? 1 : 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Server size={16} color="#ffffff" />
                <span style={{ fontWeight: 600, fontSize: 14, textDecoration: p.enabled ? 'none' : 'line-through', color: '#ffffff' }}>{p.name}</span>
                {p.enabled && <span style={{ fontSize: 10, background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', padding: '2px 6px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)' }}>Enabled</span>}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button onClick={() => handleMove(index, 'up')} disabled={index === 0} style={{ background: 'transparent', border: 'none', color: 'white', cursor: index === 0 ? 'not-allowed' : 'pointer' }}><ChevronUp size={14}/></button>
                  <button onClick={() => handleMove(index, 'down')} disabled={index === providers.length - 1} style={{ background: 'transparent', border: 'none', color: 'white', cursor: index === providers.length - 1 ? 'not-allowed' : 'pointer' }}><ChevronDown size={14}/></button>
                </div>
                <span>{p.type}</span>
                <button 
                  onClick={async () => {
                    await (window as any).electron.ipcRenderer.invoke('llm.providers.toggle', p.id, !p.enabled);
                    loadData();
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: 11, cursor: 'pointer' }}
                >
                  {p.enabled ? 'Disable' : 'Enable'}
                </button>
                <button 
                  onClick={async () => {
                    if (confirm(`Delete provider ${p.name}?`)) {
                      await (window as any).electron.ipcRenderer.invoke('llm.providers.delete', p.id);
                      loadData();
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                {providerModels.length} models synced
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button disabled={!p.enabled} onClick={() => handleTest(p.id)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: p.enabled ? 'pointer' : 'not-allowed' }}>Test Connection</button>
                <button disabled={!p.enabled} onClick={() => handleRefresh(p.id)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: p.enabled ? 'pointer' : 'not-allowed' }}>Refresh Models</button>
              </div>
            </div>
          </div>
        )})}
        {providers.length === 0 && !showAdd && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, padding: 20 }}>
            No LLM providers configured.
          </div>
        )}
      </div>
    </div>
  );
};

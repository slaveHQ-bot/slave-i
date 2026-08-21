import React, { useState, useEffect } from 'react';
import { ChevronDown, Box, Server } from 'lucide-react';

interface ModelSelectorProps {
  onSelect: (providerId: string, modelId: string) => void;
  selectedProviderId?: string;
  selectedModelId?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ onSelect, selectedProviderId, selectedModelId }) => {
  const [models, setModels] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadData = async () => {
    const mods = await (window as any).electron.ipcRenderer.invoke('llm.models.list');
    setModels(mods || []);
    const provs = await (window as any).electron.ipcRenderer.invoke('llm.providers.list');
    setProviders(provs || []);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (providerId: string, modelId: string) => {
    onSelect(providerId, modelId);
    setIsOpen(false);
  };

  const getProviderName = (id: string) => {
    const p = providers.find(p => p.id === id);
    return p ? p.name : id;
  };

  // Group models by provider
  const grouped = models.reduce((acc, m) => {
    if (!acc[m.providerId]) acc[m.providerId] = [];
    acc[m.providerId].push(m);
    return acc;
  }, {} as Record<string, any[]>);

  const currentModel = models.find(m => m.providerId === selectedProviderId && m.id === selectedModelId);

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'rgba(255,255,255,0.05)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: 8, 
          padding: '6px 12px', 
          color: '#ffffff', 
          fontSize: 13, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6, 
          cursor: 'pointer' 
        }}
      >
        <Box size={14} color="#ffffff" />
        {currentModel ? currentModel.displayName : 'Select Model'}
        <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
      </button>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          marginTop: 4, 
          width: 260, 
          background: '#000000', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: 10, 
          padding: 8, 
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          zIndex: 100,
          maxHeight: 350,
          overflowY: 'auto'
        }}>
          {Object.entries(grouped).map(([providerId, providerModels]) => (
            <div key={providerId} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, padding: '4px 8px', marginBottom: 4 }}>
                <Server size={12} /> {getProviderName(providerId)}
              </div>
              {(providerModels as any[]).map((m: any) => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m.providerId, m.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: (m.providerId === selectedProviderId && m.id === selectedModelId) ? 'rgba(255,255,255,0.15)' : 'transparent',
                    border: 'none',
                    padding: '8px 8px 8px 12px',
                    borderRadius: 6,
                    color: '#ffffff',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = (m.providerId === selectedProviderId && m.id === selectedModelId) ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = (m.providerId === selectedProviderId && m.id === selectedModelId) ? 'rgba(255,255,255,0.15)' : 'transparent'}
                >
                  {m.displayName}
                </button>
              ))}
            </div>
          ))}
          {models.length === 0 && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 12 }}>
              No models available. Add a provider in Settings and click "Refresh Models".
            </div>
          )}
        </div>
      )}
    </div>
  );
};

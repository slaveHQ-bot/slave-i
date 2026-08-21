import React, { useState } from 'react';
import { Bot, Save, X, Plus } from 'lucide-react';

interface AgentBuilderProps {
  onClose: () => void;
  onSave: (agent: any) => void;
  initialData?: any;
}

export function AgentBuilder({ onClose, onSave, initialData }: AgentBuilderProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'specialist',
    instructions: initialData?.instructions || '',
    model: initialData?.model || 'gpt-4o',
    provider: initialData?.provider || 'openai',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-background)', color: 'var(--color-text)', height: '100%' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bot size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{initialData ? 'Edit Agent' : 'Create New Agent'}</h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <form id="agent-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500 }}>Agent Name</label>
            <input 
              name="name" value={formData.name} onChange={handleChange} required
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: 8, color: 'var(--color-text)', outline: 'none' }} 
              placeholder="e.g. Research Specialist"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500 }}>Description</label>
            <input 
              name="description" value={formData.description} onChange={handleChange}
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: 8, color: 'var(--color-text)', outline: 'none' }} 
              placeholder="What does this agent specialize in?"
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500 }}>Agent Type</label>
              <select name="type" value={formData.type} onChange={handleChange} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: 8, color: 'var(--color-text)', outline: 'none' }}>
                <option value="specialist">Specialist</option>
                <option value="orchestrator">Orchestrator</option>
                <option value="utility">Utility</option>
              </select>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500 }}>Default Model</label>
              <input 
                name="model" value={formData.model} onChange={handleChange}
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: 8, color: 'var(--color-text)', outline: 'none' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500 }}>System Instructions</label>
            <textarea 
              name="instructions" value={formData.instructions} onChange={handleChange} rows={6}
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '10px 12px', borderRadius: 8, color: 'var(--color-text)', outline: 'none', resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} 
              placeholder="You are an expert researcher..."
            />
          </div>
        </form>
      </div>

      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 500 }}>
          Cancel
        </button>
        <button type="submit" form="agent-form" style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: 'var(--color-background)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          <Save size={14} /> Save Agent
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Brain, Download, Plus, Search, Trash2, AlertTriangle } from 'lucide-react';

type Scope = 'user' | 'project' | 'conversation' | 'task' | 'agent' | 'system';
const SCOPES: Scope[] = ['user', 'project', 'conversation', 'task', 'agent', 'system'];

interface Memory { id: string; scope: Scope; source: string; content: string; confidence: number; createdAt: number; updatedAt: number; }

export function MemoryBrowser() {
  const [activeScope, setActiveScope] = useState<Scope>('user');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [newSource, setNewSource] = useState('user');
  const [newContent, setNewContent] = useState('');

  const load = async () => {
    try {
      // @ts-ignore
      const data = await window.api.getMemories(activeScope);
      setMemories(data);
    } catch (_e) { setMemories([]); }
  };

  useEffect(() => { load(); }, [activeScope]);

  const filtered = memories.filter(m =>
    m.content.toLowerCase().includes(search.toLowerCase()) ||
    m.source.toLowerCase().includes(search.toLowerCase())
  );

  const saveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    // @ts-ignore
    await window.api.memory.update(id, editContent.trim());
    setEditId(null);
    load();
  };

  const deleteMemory = async (id: string) => {
    // @ts-ignore
    await window.api.memory.delete(id);
    load();
  };

  const addMemory = async () => {
    if (!newContent.trim()) return;
    // @ts-ignore
    await window.api.saveMemory(activeScope, newSource.trim() || 'user', newContent.trim());
    setAddMode(false); setNewSource('user'); setNewContent('');
    load();
  };

  const forgetAll = async () => {
    if (confirm('Are you sure you want to delete ALL memories across ALL scopes? This cannot be undone.')) {
      // @ts-ignore
      await window.api.memory.forgetAll();
      load();
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(memories, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${activeScope}-knowledge.json`; a.click();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: 40, background: '#000000', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Brain size={24} color="rgba(255,255,255,0.8)" /> KnowledgeBase
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            Semantic long-term memory layer for agents and tools.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={exportJson} style={btnStyle}>
            <Download size={14} /> Export JSON
          </button>
          <button onClick={() => setAddMode(p => !p)} style={{ ...btnStyle, background: '#ffffff', color: '#000000' }}>
            <Plus size={14} /> Add Memory
          </button>
          <button onClick={forgetAll} style={{ ...btnStyle, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={14} /> Forget Everything
          </button>
        </div>
      </div>

      {/* Scope tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 24 }}>
        {SCOPES.map(s => (
          <button
            key={s}
            onClick={() => setActiveScope(s)}
            style={{
              padding: '12px 24px', background: 'none', border: 'none',
              borderBottom: activeScope === s ? '2px solid #ffffff' : '2px solid transparent',
              color: activeScope === s ? '#ffffff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s', textTransform: 'capitalize'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0 16px', marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} color="rgba(255,255,255,0.4)" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search knowledge..."
          style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', padding: '12px 0', width: '100%', fontSize: 14 }}
        />
      </div>

      {/* Add form */}
      {addMode && (
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24, marginBottom: 24, display: 'flex', gap: 16, flexDirection: 'column' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>SOURCE</label>
            <input placeholder="e.g. user, task_slave, etc." value={newSource} onChange={e => setNewSource(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>CONTENT</label>
            <textarea placeholder="Factual content..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => setAddMode(false)} style={btnStyle}>Cancel</button>
            <button onClick={addMemory} style={{ ...btnStyle, background: '#ffffff', color: '#000000', fontWeight: 600 }}>Save Knowledge</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            No knowledge entries found in {activeScope} scope.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(m => (
              <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em' }}>
                      {m.source.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => { setEditId(m.id); setEditContent(m.content); }} style={{ ...btnStyle, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Edit</button>
                    <button onClick={() => deleteMemory(m.id)} style={{ ...btnStyle, background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {editId === m.id ? (
                  <div style={{ marginTop: 8, display: 'flex', gap: 12, flexDirection: 'column' }}>
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditId(null)} style={btnStyle}>Cancel</button>
                      <button onClick={() => saveEdit(m.id)} style={{ ...btnStyle, background: '#ffffff', color: '#000000', fontWeight: 600 }}>Save</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {m.content}
                  </div>
                )}
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

const btnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  background: 'rgba(255,255,255,0.05)', border: 'none',
  color: '#ffffff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
};

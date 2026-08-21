import React, { useEffect, useState } from 'react';
import { FolderOpen, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate]   = useState(false);
  const [newName, setNewName]         = useState('');
  const [newDesc, setNewDesc]         = useState('');
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editName, setEditName]       = useState('');
  const [selected, setSelected]       = useState<Project | null>(null);

  const load = async () => {
    // @ts-ignore
    const data = await window.api?.projects?.list() ?? [];
    setProjects(data);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName.trim()) return;
    // @ts-ignore
    await window.api?.projects?.create(newName.trim(), newDesc.trim());
    setNewName(''); setNewDesc(''); setShowCreate(false);
    load();
  };

  const del = async (id: string) => {
    // @ts-ignore
    await window.api?.projects?.delete(id);
    if (selected?.id === id) setSelected(null);
    load();
  };

  const rename = async (id: string) => {
    if (!editName.trim()) return;
    // @ts-ignore
    await window.api?.projects?.rename(id, editName.trim());
    setEditingId(null);
    load();
  };

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* List panel */}
      <div style={{ width: 300, borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderOpen size={16} color="#ffffff" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', flex: 1 }}>Projects</span>
          <button
            onClick={() => setShowCreate(p => !p)}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#ffffff', padding: '4px 10px', borderRadius: 7, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={12} /> New
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div style={{ padding: 14, background: 'rgba(168,85,247,0.06)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
            <input
              placeholder="Project name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && create()}
              style={inputStyle}
            />
            <textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              rows={2}
              style={{ ...inputStyle, marginTop: 8, resize: 'none' }}
            />
            <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={btnSecondary}><X size={12} /></button>
              <button onClick={create} style={btnPrimary}><Check size={12} /> Create</button>
            </div>
          </div>
        )}

        {/* Project list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
              No projects yet. Create one!
            </div>
          ) : (
            projects.map(p => (
              <div
                key={p.id}
                onClick={() => setSelected(p)}
                style={{
                  padding: '12px 16px', cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: selected?.id === p.id ? 'rgba(168,85,247,0.1)' : 'transparent',
                  borderLeft: selected?.id === p.id ? '3px solid #ffffff' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {editingId === p.id ? (
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') rename(p.id); if (e.key === 'Escape') setEditingId(null); }}
                      autoFocus
                      style={{ ...inputStyle, flex: 1, padding: '4px 8px' }}
                    />
                    <button onClick={() => rename(p.id)} style={btnPrimary}><Check size={11} /></button>
                    <button onClick={() => setEditingId(null)} style={btnSecondary}><X size={11} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FolderOpen size={13} color={selected?.id === p.id ? '#ffffff' : 'rgba(255,255,255,0.4)'} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: selected?.id === p.id ? '#ffffff' : 'rgba(255,255,255,0.7)' }}>{p.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); setEditingId(p.id); setEditName(p.name); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 2, display: 'flex' }}
                    ><Edit2 size={11} /></button>
                    <button
                      onClick={e => { e.stopPropagation(); del(p.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.6)', padding: 2, display: 'flex' }}
                    ><Trash2 size={11} /></button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderOpen size={24} color="rgba(168,85,247,0.6)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Select a Project</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Or create a new one to get started</div>
            </div>
          </div>
        ) : (
          <div style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderOpen size={20} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>{selected.name}</h2>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                  Created {new Date(selected.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {selected.description && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>{selected.description}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Chats', value: '0' },
                { label: 'Agents', value: '0' },
                { label: 'Files', value: '0' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', padding: 20 }}>
              Project chats and agent assignments coming soon.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#ffffff', padding: '7px 10px', borderRadius: 7, fontSize: 12, outline: 'none',
};
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4,
  background: 'rgba(168,85,247,0.25)', border: '1px solid rgba(168,85,247,0.4)',
  color: '#ffffff', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
};
const btnSecondary: React.CSSProperties = {
  display: 'flex', alignItems: 'center',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.6)', padding: '4px 8px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
};

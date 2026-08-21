import React, { useState } from 'react';
import { MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';

interface ChatSidebarItemProps {
  id: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}

export const ChatSidebarItem: React.FC<ChatSidebarItemProps> = ({ id, title, isActive, onClick, onDelete, onRename }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);

  const handleSave = () => {
    if (editValue.trim() && editValue !== title) {
      onRename(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 10px',
        borderRadius: 8,
        cursor: 'pointer',
        marginBottom: 2,
        background: isActive ? 'rgba(255,255,255,0.15)' : (isHovered ? 'rgba(255,255,255,0.05)' : 'transparent'),
        transition: 'background 0.15s',
      }}
    >
      <MessageSquare 
        size={14} 
        color={isActive ? '#ffffff' : 'rgba(255,255,255,0.4)'} 
        style={{ flexShrink: 0, marginRight: 8 }} 
      />
      
      {isEditing ? (
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 4 }}>
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(168,85,247,0.5)',
              borderRadius: 4,
              color: 'white',
              fontSize: 12,
              padding: '2px 4px',
              outline: 'none',
              width: 0, // prevents overflow
            }}
          />
          <button onClick={handleSave} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 2 }}><Check size={12} /></button>
          <button onClick={handleCancel} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 2 }}><X size={12} /></button>
        </div>
      ) : (
        <div 
          onClick={onClick} 
          style={{ 
            flex: 1, 
            fontSize: 12, 
            color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis' 
          }}
        >
          {title || 'New Session'}
        </div>
      )}

      {isHovered && !isEditing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 2 }}
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.7)', cursor: 'pointer', padding: 2 }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, Check, Copy, Edit2, RefreshCw, X } from 'lucide-react';

export interface MessageActionsProps {
  messageText: string;
  isUser: boolean;
  isBookmarked?: boolean;
  onBookmark: () => void;
  onRegenerate?: () => void;
  onEdit?: (newText: string) => void;
  onCopy: () => void;
}

export function MessageActions({
  messageText,
  isUser,
  isBookmarked,
  onBookmark,
  onRegenerate,
  onEdit,
  onCopy,
}: MessageActionsProps) {
  const [editing, setEditing]   = useState(false);
  const [editText, setEditText] = useState(messageText);
  const [copied, setCopied]     = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(messageText);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 1500);
  };

  const handleEditSubmit = () => {
    if (onEdit && editText.trim()) {
      onEdit(editText.trim());
      setEditing(false);
    }
  };

  if (editing && isUser) {
    return (
      <div style={{ marginTop: 8 }}>
        <textarea
          value={editText}
          onChange={e => setEditText(e.target.value)}
          autoFocus
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(168,85,247,0.4)',
            color: '#ffffff', padding: '8px 12px', borderRadius: 8,
            fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit',
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSubmit(); }
            if (e.key === 'Escape') { setEditing(false); setEditText(messageText); }
          }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
          <button onClick={() => { setEditing(false); setEditText(messageText); }} style={btnStyle}>
            <X size={11} /> Cancel
          </button>
          <button onClick={handleEditSubmit} style={{ ...btnStyle, background: 'rgba(168,85,247,0.2)', color: '#ffffff', borderColor: 'rgba(168,85,247,0.35)' }}>
            <Check size={11} /> Send
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', gap: 4, marginTop: 4, opacity: 0,
      // The parent <MessageBubble> sets `.msg-actions` visible on hover via CSS class
      className: 'msg-actions',
    } as any}>
      {/* Copy */}
      <ActionBtn onClick={handleCopy} title="Copy" active={copied}>
        {copied ? <Check size={11} /> : <Copy size={11} />}
      </ActionBtn>

      {/* Bookmark */}
      <ActionBtn onClick={onBookmark} title={isBookmarked ? 'Remove bookmark' : 'Bookmark'} active={isBookmarked}>
        {isBookmarked ? <BookmarkCheck size={11} /> : <Bookmark size={11} />}
      </ActionBtn>

      {/* Edit (user messages only) */}
      {isUser && onEdit && (
        <ActionBtn onClick={() => setEditing(true)} title="Edit and re-send">
          <Edit2 size={11} />
        </ActionBtn>
      )}

      {/* Regenerate (agent messages only) */}
      {!isUser && onRegenerate && (
        <ActionBtn onClick={onRegenerate} title="Regenerate response">
          <RefreshCw size={11} />
        </ActionBtn>
      )}
    </div>
  );
}

function ActionBtn({ onClick, title, active, children }: { onClick: () => void; title: string; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        ...btnStyle,
        background: active ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)',
        color: active ? '#ffffff' : 'rgba(255,255,255,0.4)',
        borderColor: active ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.08)',
      }}
    >
      {children}
    </button>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.4)', borderRadius: 5, padding: '3px 7px',
  fontSize: 11, cursor: 'pointer', transition: 'all 0.15s',
};

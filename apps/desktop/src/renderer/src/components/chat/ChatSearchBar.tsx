import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';

export interface SearchResult {
  messageIndex: number;
  matchStart: number;
  matchEnd: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  messages: Array<{ role: string; text: string }>;
  onJumpTo: (index: number) => void;
}

function findAll(query: string, messages: Props['messages']): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];
  messages.forEach((msg, mi) => {
    const text = msg.text.toLowerCase();
    let pos = 0;
    while (true) {
      const idx = text.indexOf(q, pos);
      if (idx === -1) break;
      results.push({ messageIndex: mi, matchStart: idx, matchEnd: idx + q.length });
      pos = idx + 1;
    }
  });
  return results;
}

export function ChatSearchBar({ open, onClose, messages, onJumpTo }: Props) {
  const [query, setQuery]       = useState('');
  const [cursor, setCursor]     = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = findAll(query, messages);
  const total   = results.length;

  useEffect(() => {
    if (open) { setQuery(''); setCursor(0); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open]);

  useEffect(() => { setCursor(0); }, [query]);

  useEffect(() => {
    if (total > 0) onJumpTo(results[cursor]?.messageIndex ?? 0);
  }, [cursor, results.length]);

  if (!open) return null;

  const prev = () => setCursor(c => (c - 1 + total) % total);
  const next = () => setCursor(c => (c + 1) % total);

  return (
    <div style={{
      position: 'absolute', top: 8, right: 12, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'rgba(8,11,18,0.97)', border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 10, padding: '6px 10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)',
    }}>
      <Search size={13} color="rgba(255,255,255,0.4)" />
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.shiftKey ? prev() : next(); }
          if (e.key === 'Escape') onClose();
        }}
        placeholder="Search messages…"
        style={{
          background: 'none', border: 'none', outline: 'none',
          color: '#ffffff', fontSize: 13, width: 200, fontFamily: 'inherit',
        }}
      />
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', minWidth: 48, textAlign: 'right' }}>
        {total > 0 ? `${cursor + 1} / ${total}` : query ? '0 results' : ''}
      </span>
      <button onClick={prev} disabled={total === 0} style={navBtn} title="Previous (Shift+Enter)">
        <ChevronUp size={13} />
      </button>
      <button onClick={next} disabled={total === 0} style={navBtn} title="Next (Enter)">
        <ChevronDown size={13} />
      </button>
      <button onClick={onClose} style={navBtn} title="Close (Escape)">
        <X size={13} />
      </button>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.5)', borderRadius: 6, padding: '3px 6px',
  cursor: 'pointer', display: 'flex', alignItems: 'center',
};

import React, { useMemo } from 'react';

// Minimal markdown renderer: code blocks, inline code, bold, italic, links, tables, lists
interface MarkdownProps {
  content: string;
  style?: React.CSSProperties;
}

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Language → color hint for code block header
const LANG_COLOR: Record<string, string> = {
  js: '#f7df1e', ts: '#3178c6', tsx: '#3178c6', jsx: '#61dafb', py: '#3776ab',
  python: '#3776ab', bash: '#89e051', sh: '#89e051', json: '#f59e0b',
  html: '#e34c26', css: '#264de4', rust: '#dea584', go: '#00add8',
  sql: '#336791', yaml: '#cb171e', md: '#ffffff', markdown: '#ffffff',
};

function renderInline(text: string): string {
  // Bold **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>');
  // Italic *text*
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code `code`
  text = text.replace(/`([^`]+)`/g, '<code style="background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.2);border-radius:4px;padding:1px 5px;font-family:monospace;font-size:12px;color:#c4b5fd">$1</code>');
  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#60a5fa;text-decoration:underline" target="_blank" rel="noopener">$1</a>');
  return text;
}

interface Block {
  type: 'code' | 'table' | 'ul' | 'ol' | 'blockquote' | 'heading' | 'paragraph' | 'hr';
  raw: string;
  lang?: string;
}

function tokenize(input: string): Block[] {
  const lines = input.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code fence
    const codeFenceMatch = line.match(/^```(\w*)/);
    if (codeFenceMatch) {
      const lang = codeFenceMatch[1] || '';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: 'code', raw: codeLines.join('\n'), lang });
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      blocks.push({ type: 'heading', raw: headingMatch[2], lang: String(headingMatch[1].length) });
      i++;
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: 'hr', raw: '' });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        bqLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: 'blockquote', raw: bqLines.join('\n') });
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s/, ''));
        i++;
      }
      blocks.push({ type: 'ul', raw: items.join('\n') });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      blocks.push({ type: 'ol', raw: items.join('\n') });
      continue;
    }

    // Table (line with |)
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].match(/^[\s|:-]+$/)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'table', raw: tableLines.join('\n') });
      continue;
    }

    // Empty line → skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph (collect consecutive non-empty, non-special lines)
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^[>*+-]|^```|^#{1,6}\s|^\d+\.|^---/)) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', raw: paraLines.join('\n') });
    }
  }

  return blocks;
}

function renderBlock(block: Block, idx: number): React.ReactNode {
  switch (block.type) {
    case 'code': {
      const langKey = block.lang?.toLowerCase() ?? '';
      const color = LANG_COLOR[langKey] ?? '#94a3b8';
      return (
        <div key={idx} style={{ margin: '10px 0', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 12px', background: 'rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 11, color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{block.lang || 'code'}</span>
            <button
              onClick={() => navigator.clipboard?.writeText(block.raw)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'rgba(255,255,255,0.4)', padding: '2px 6px', borderRadius: 4, ':hover': { color: 'white' } } as any}
            >copy</button>
          </div>
          <pre style={{ margin: 0, padding: '12px 14px', overflowX: 'auto', background: 'rgba(0,0,0,0.4)', fontSize: 12, lineHeight: 1.6, color: '#e2e8f0', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
            <code>{block.raw}</code>
          </pre>
        </div>
      );
    }
    case 'heading': {
      const level = parseInt(block.lang ?? '1', 10);
      const sizes: Record<number, number> = { 1: 18, 2: 16, 3: 14, 4: 13, 5: 12, 6: 11 };
      return (
        <div key={idx} style={{ fontSize: sizes[level] ?? 13, fontWeight: 700, color: '#e2e8f0', margin: '12px 0 6px', lineHeight: 1.4 }}
          dangerouslySetInnerHTML={{ __html: renderInline(escapeHtml(block.raw)) }} />
      );
    }
    case 'hr':
      return <hr key={idx} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '12px 0' }} />;
    case 'blockquote': {
      const isAlert = block.raw.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|ERROR|TAKEOVER)\]\n/i);
      if (isAlert) {
        const type = isAlert[1].toUpperCase();
        const content = block.raw.substring(isAlert[0].length);
        
        let color = 'rgba(255,255,255,0.6)';
        let bg = 'rgba(255,255,255,0.05)';
        let border = 'rgba(255,255,255,0.2)';
        
        if (type === 'ERROR' || type === 'CAUTION') { color = '#ef4444'; bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.3)'; }
        if (type === 'WARNING') { color = '#f59e0b'; bg = 'rgba(245,158,11,0.1)'; border = 'rgba(245,158,11,0.3)'; }
        if (type === 'IMPORTANT' || type === 'TAKEOVER') { color = '#3b82f6'; bg = 'rgba(59,130,246,0.1)'; border = 'rgba(59,130,246,0.3)'; }
        if (type === 'TIP' || type === 'NOTE') { color = '#22c55e'; bg = 'rgba(34,197,94,0.1)'; border = 'rgba(34,197,94,0.3)'; }
        
        return (
          <div key={idx} style={{ 
            border: `1px solid ${border}`, borderLeft: `4px solid ${color}`,
            background: bg, padding: '12px 16px', margin: '12px 0', borderRadius: 8,
            color: 'rgba(255,255,255,0.85)', fontSize: 13 
          }}>
            <div style={{ color, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              {type === 'TAKEOVER' ? 'HUMAN TAKEOVER' : type}
            </div>
            <div dangerouslySetInnerHTML={{ __html: renderInline(escapeHtml(content)) }} style={{ lineHeight: 1.6 }} />
          </div>
        );
      }
      return (
        <div key={idx} style={{ borderLeft: '3px solid rgba(168,85,247,0.5)', paddingLeft: 12, margin: '8px 0', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontSize: 12 }}
          dangerouslySetInnerHTML={{ __html: renderInline(escapeHtml(block.raw)) }} />
      );
    }
    case 'ul':
      return (
        <ul key={idx} style={{ margin: '6px 0', paddingLeft: 20, color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.7 }}>
          {block.raw.split('\n').map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(escapeHtml(item)) }} />
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={idx} style={{ margin: '6px 0', paddingLeft: 20, color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.7 }}>
          {block.raw.split('\n').map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(escapeHtml(item)) }} />
          ))}
        </ol>
      );
    case 'table': {
      const rows = block.raw.split('\n').filter(r => r.includes('|'));
      const header = rows[0]?.split('|').filter(Boolean).map(c => c.trim()) ?? [];
      const body = rows.slice(2); // skip separator row
      return (
        <div key={idx} style={{ overflowX: 'auto', margin: '10px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>{header.map((h, i) => <th key={i} style={{ padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#c4b5fd', fontWeight: 600, textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: renderInline(escapeHtml(h)) }} />)}</tr>
            </thead>
            <tbody>
              {body.map((row, ri) => {
                const cells = row.split('|').filter(Boolean).map(c => c.trim());
                return (
                  <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {cells.map((c, ci) => <td key={ci} style={{ padding: '6px 10px', color: 'rgba(255,255,255,0.7)' }} dangerouslySetInnerHTML={{ __html: renderInline(escapeHtml(c)) }} />)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    case 'paragraph':
    default:
      return (
        <p key={idx} style={{ margin: '4px 0', fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}
          dangerouslySetInnerHTML={{ __html: renderInline(escapeHtml(block.raw)) }} />
      );
  }
}

export function MarkdownRenderer({ content, style }: MarkdownProps) {
  const blocks = useMemo(() => tokenize(content), [content]);
  return (
    <div style={{ wordBreak: 'break-word', ...style }}>
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}

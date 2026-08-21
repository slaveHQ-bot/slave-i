import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface AdvancedControlsProps {
  temperature: number;
  setTemperature: (val: number) => void;
  maxTokens: number;
  setMaxTokens: (val: number) => void;
}

export const AdvancedControls: React.FC<AdvancedControlsProps> = ({ temperature, setTemperature, maxTokens, setMaxTokens }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: isOpen ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: 8, 
          padding: '6px', 
          color: isOpen ? '#ffffff' : '#ffffff', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        title="Advanced Generation Parameters"
      >
        <SlidersHorizontal size={14} />
      </button>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          bottom: 'calc(100% + 8px)', 
          left: 0, 
          width: 260, 
          background: 'rgba(15, 23, 42, 0.95)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: 12, 
          padding: 16, 
          boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
          zIndex: 50,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#ffffff', letterSpacing: '0.05em' }}>TEMPERATURE</label>
              <span style={{ fontSize: 11, color: '#ffffff', fontFamily: 'monospace', background: 'rgba(168,85,247,0.1)', padding: '2px 6px', borderRadius: 4 }}>{temperature.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0" max="2" step="0.05" 
              value={temperature} 
              onChange={e => setTemperature(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#ffffff', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Precise</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Creative</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#ffffff', letterSpacing: '0.05em' }}>MAX TOKENS</label>
              <span style={{ fontSize: 11, color: '#e5e5e5', fontFamily: 'monospace', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: 4 }}>{maxTokens}</span>
            </div>
            <input 
              type="range" 
              min="256" max="32768" step="256" 
              value={maxTokens} 
              onChange={e => setMaxTokens(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#e5e5e5', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Short</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Long</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

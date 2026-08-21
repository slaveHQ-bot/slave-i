import React, { useEffect, useRef } from 'react';

export interface AutocompleteOption {
  id: string;
  label: string;
  icon?: React.ElementType;
  description?: string;
  color?: string;
}

interface AutocompletePopoverProps {
  options: AutocompleteOption[];
  selectedIndex: number;
  onSelect: (option: AutocompleteOption) => void;
  position: { bottom: string | number; left: string | number };
}

export const AutocompletePopover: React.FC<AutocompletePopoverProps> = ({ options, selectedIndex, onSelect, position }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll selected item into view
    if (containerRef.current) {
      const selectedEl = containerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (options.length === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        bottom: position.bottom,
        left: position.left,
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 6,
        boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 200,
        maxHeight: 250,
        overflowY: 'auto'
      }}
    >
      {options.map((option, idx) => {
        const Icon = option.icon;
        const isSelected = idx === selectedIndex;
        return (
          <div
            key={option.id}
            onClick={() => onSelect(option)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              background: isSelected ? 'rgba(168,85,247,0.2)' : 'transparent',
              border: `1px solid ${isSelected ? 'rgba(168,85,247,0.4)' : 'transparent'}`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              transition: 'all 0.1s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {Icon && <Icon size={14} color={option.color || (isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)')} />}
              <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 500, color: isSelected ? '#fff' : '#ffffff' }}>
                {option.label}
              </span>
            </div>
            {option.description && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', paddingLeft: Icon ? 22 : 0 }}>
                {option.description}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import {
  Bot, Cpu, Globe, Info, Keyboard, Mic, Monitor,
  Moon, Palette, Server, Settings, Sliders, X, Zap,
} from 'lucide-react';
import { LLMProviderSettings } from './LLMProviderSettings';

interface Props {
  open: boolean;
  onClose: () => void;
  ttsEnabled: boolean;
  setTtsEnabled: (v: boolean) => void;
  developerMode: boolean;
  setDeveloperMode: (v: boolean) => void;
}

type TabId = 'general' | 'appearance' | 'chat' | 'providers' | 'voice' | 'shortcuts' | 'about';

const TABS: { id: TabId; label: string; icon: React.FC<any> }[] = [
  { id: 'general',    label: 'General',    icon: Settings },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'chat',       label: 'Chat',       icon: Cpu },
  { id: 'providers',  label: 'Providers',  icon: Server },
  { id: 'voice',      label: 'Voice',      icon: Mic },
  { id: 'shortcuts',  label: 'Shortcuts',  icon: Keyboard },
  { id: 'about',      label: 'About',      icon: Info },
];

const SHORTCUTS = [
  { key: 'Ctrl+K',   action: 'Open Command Palette' },
  { key: 'Ctrl+N',   action: 'New Chat' },
  { key: 'Ctrl+,',   action: 'Open Settings' },
  { key: 'Ctrl+F',   action: 'Search Messages' },
  { key: 'Escape',   action: 'Close Overlay' },
  { key: 'Enter',    action: 'Send Message' },
  { key: 'Shift+↵',  action: 'New Line in Input' },
  { key: '↑↓',       action: 'Navigate Autocomplete' },
];

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
        background: checked ? 'rgba(168,85,247,0.8)' : 'rgba(255,255,255,0.12)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: 'white',
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#ffffff' }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: 16 }}>{children}</div>
    </div>
  );
}

export function SettingsModal({ open, onClose, ttsEnabled, setTtsEnabled, developerMode, setDeveloperMode }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [fontSize, setFontSize]   = useState(14);
  const [compact, setCompact]     = useState(false);
  const [autoSave, setAutoSave]   = useState(true);
  const [streaming, setStreaming] = useState(true);
  const [voices, setVoices]       = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  useEffect(() => {
    if (!open) return;
    // @ts-ignore
    window.api?.getConfig?.().then((cfg: any) => {
      if (cfg.fontSize) setFontSize(cfg.fontSize);
      if (cfg.compact !== undefined) setCompact(cfg.compact);
      if (cfg.autoSave !== undefined) setAutoSave(cfg.autoSave);
      if (cfg.streaming !== undefined) setStreaming(cfg.streaming);
      if (cfg.selectedVoice) setSelectedVoice(cfg.selectedVoice);
    });
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [open]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const saveAndClose = async () => {
    // @ts-ignore
    await window.api?.setConfig?.({ ttsEnabled, fontSize, compact, autoSave, streaming, selectedVoice, developerMode });
    onClose();
  };

  if (!open) return null;

  const renderTab = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div>
            <SettingRow label="Language" description="Interface language (more coming soon)">
              <select style={selectStyle} value="en" onChange={() => {}}>
                <option value="en">English</option>
              </select>
            </SettingRow>
            <SettingRow label="Compact Mode" description="Reduce padding and spacing throughout the UI">
              <ToggleSwitch checked={compact} onChange={setCompact} />
            </SettingRow>
            <SettingRow label="Developer Mode" description="Show advanced agent execution, automation, and network features">
              <ToggleSwitch checked={developerMode} onChange={setDeveloperMode} />
            </SettingRow>
          </div>
        );
      case 'appearance':
        return (
          <div>
            <SettingRow label="Font Size" description={`Interface font size: ${fontSize}px`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="range" min={12} max={18} value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                  style={{ width: 120, accentColor: '#ffffff' }}
                />
                <span style={{ fontSize: 12, color: '#ffffff', minWidth: 30 }}>{fontSize}px</span>
              </div>
            </SettingRow>
            <SettingRow label="Theme" description="UI color theme">
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'Dark', icon: Moon },
                  { label: 'System', icon: Monitor },
                ].map(({ label, icon: Icon }) => (
                  <button key={label} style={{ ...chipStyle, background: label === 'Dark' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${label === 'Dark' ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>
            </SettingRow>
          </div>
        );
      case 'chat':
        return (
          <div>
            <SettingRow label="Auto-save Messages" description="Automatically save messages to the database">
              <ToggleSwitch checked={autoSave} onChange={setAutoSave} />
            </SettingRow>
            <SettingRow label="Text-to-Speech" description="Read assistant responses aloud">
              <ToggleSwitch checked={ttsEnabled} onChange={setTtsEnabled} />
            </SettingRow>
            <SettingRow label="Streaming Responses" description="Show responses as they stream in">
              <ToggleSwitch checked={streaming} onChange={setStreaming} />
            </SettingRow>
          </div>
        );
      case 'providers':
        return <LLMProviderSettings />;
      case 'voice':
        return (
          <div>
            <SettingRow label="Text-to-Speech" description="Enable voice output for responses">
              <ToggleSwitch checked={ttsEnabled} onChange={setTtsEnabled} />
            </SettingRow>
            <SettingRow label="Voice" description="Select the TTS voice">
              <select
                value={selectedVoice}
                onChange={e => setSelectedVoice(e.target.value)}
                style={{ ...selectStyle, maxWidth: 220 }}
              >
                <option value="">Default</option>
                {voices.filter(v => v.lang.startsWith('en')).map(v => (
                  <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                ))}
              </select>
            </SettingRow>
          </div>
        );
      case 'shortcuts':
        return (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: 11, color: 'rgba(255,255,255,0.4)', padding: '6px 0', fontWeight: 500 }}>Shortcut</th>
                  <th style={{ textAlign: 'left', fontSize: 11, color: 'rgba(255,255,255,0.4)', padding: '6px 0', fontWeight: 500 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {SHORTCUTS.map(s => (
                  <tr key={s.key} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 0' }}>
                      <kbd style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5, padding: '2px 7px', fontSize: 12, color: '#ffffff', fontFamily: 'monospace' }}>
                        {s.key}
                      </kbd>
                    </td>
                    <td style={{ padding: '10px 0', fontSize: 13, color: '#ffffff' }}>{s.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'about':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32, gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #ffffff, #e5e5e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(168,85,247,0.4)' }}>
              <Zap size={32} color="white" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>Slave</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Universal AI Orchestration</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>v1.0.0 · Built with Electron + React</div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {['GitHub', 'Docs', 'Discord'].map(l => (
                <button key={l} style={chipStyle}>{l}</button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9990, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 760, height: 560, background: 'rgba(8,11,18,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, display: 'flex', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}
      >
        {/* Left sidebar */}
        <div style={{ width: 190, borderRight: '1px solid rgba(255,255,255,0.07)', padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', padding: '4px 10px', marginBottom: 8, letterSpacing: '0.05em' }}>SETTINGS</div>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s', textAlign: 'left',
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 24px' }}>
            {renderTab()}
          </div>

          {/* Footer */}
          {activeTab !== 'about' && (
            <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={onClose} style={{ ...chipStyle }}>Cancel</button>
              <button onClick={saveAndClose} style={{ background: 'rgba(168,85,247,0.8)', border: 'none', color: 'white', padding: '7px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#ffffff', padding: '6px 10px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
};

const chipStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.7)', padding: '5px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
};

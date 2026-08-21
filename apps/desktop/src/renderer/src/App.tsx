import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Bot, Settings, Activity, Cpu, X, Globe,
  Mic, MicOff, Volume2, VolumeX, Shield, Zap,
  GitBranch, Database, Brain, Code, Search, Link,
  Clock, CheckCircle, XCircle, Loader, Eye, Terminal,
  ChevronRight, Layers, BarChart3, Plus, MessageSquare,
  Paperclip, FileText, Image as ImageIcon, BarChart2, FolderOpen,
  Home, CheckSquare, Layout, Book, Server
} from 'lucide-react';
import { ModelSelector } from './components/chat/ModelSelector';
import { ChatSidebarItem } from './components/chat/ChatSidebarItem';
import { AdvancedControls } from './components/chat/AdvancedControls';
import { AutocompletePopover, AutocompleteOption } from './components/chat/AutocompletePopover';
import { SettingsModal } from './components/settings/SettingsModal';
import { ToastProvider, useToast } from './components/ui/ToastProvider';
import { CommandPalette, buildCommands } from './components/ui/CommandPalette';
import { AgentWorkforceView } from './components/agents/AgentWorkforceView';
import { MemoryBrowser } from './components/memory/MemoryBrowser';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { ProjectsView } from './components/projects/ProjectsView';
import { NotificationCenter, Notification as AppNotification } from './components/ui/NotificationCenter';
import { MarkdownRenderer } from './components/chat/MarkdownRenderer';
import { MessageActions } from './components/chat/MessageActions';
import { ChatSearchBar } from './components/chat/ChatSearchBar';
import { PluginMarketplace } from './components/plugins/PluginMarketplace';
import { AutomationsView } from './components/automations/AutomationsView';
import { McpView } from './components/mcp/McpView';
import { RightPanel } from './components/layout/RightPanel';
import { ActivityCenter } from './components/activity/ActivityCenter';

// ─── Slave metadata ─────────────────────────────────────────────────────────
const SLAVE_META: Record<string, { icon: any; tier: 0 | 1 | 2; color: string }> = {
  task_slave:           { icon: Layers,       tier: 0, color: '#ffffff' },
  verification_slave:   { icon: CheckCircle,  tier: 0, color: '#ffffff' },
  browser_slave:        { icon: Globe,        tier: 1, color: '#e5e5e5' },
  computer_slave:       { icon: Eye,          tier: 1, color: '#e5e5e5' },
  code_slave:           { icon: Code,         tier: 1, color: '#e5e5e5' },
  research_slave:       { icon: Search,       tier: 1, color: '#e5e5e5' },
  file_slave:           { icon: Database,     tier: 1, color: '#e5e5e5' },
  data_slave:           { icon: BarChart3,    tier: 1, color: '#e5e5e5' },
  creative_slave:       { icon: Zap,          tier: 2, color: '#a3a3a3' },
  communication_slave:  { icon: Send,         tier: 2, color: '#a3a3a3' },
  knowledge_slave:      { icon: Brain,        tier: 2, color: '#a3a3a3' },
  integration_slave:    { icon: Link,         tier: 2, color: '#a3a3a3' },
  security_slave:       { icon: Shield,       tier: 2, color: '#a3a3a3' },
  automation_slave:     { icon: Clock,        tier: 2, color: '#a3a3a3' },
};

const TIER_NAMES = ['Control Plane', 'Execution', 'Productivity'];
const TIER_COLORS = ['#ffffff', '#e5e5e5', '#a3a3a3'];
const TIER_BG     = ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.04)'];

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message { id?: string; role: 'user' | 'agent' | 'system'; text: string; ts: number; isStream?: boolean }
interface ActivityEntry { text: string; ts: number; slaveId?: string; }
interface Attachment { id: string; file: File; type: 'image' | 'text' | 'unknown'; previewUrl?: string; content?: string; }

// ─── Main Component ──────────────────────────────────────────────────────────
const App = () => {
  const [intent, setIntent]               = useState('');
  const [messages, setMessages]           = useState<Message[]>([]);
  const [activity, setActivity]           = useState<ActivityEntry[]>([]);
  const [isProcessing, setIsProcessing]   = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [takeoverTarget, setTakeoverTarget] = useState<string | null>(null);
  const [rightPanelContext, setRightPanelContext] = useState<{ type: 'agent' | 'task' | 'file' | 'project', id: string, data?: any } | null>(null);
  const [hoveredMsgIndex, setHoveredMsgIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings]   = useState(false);
  const [ttsEnabled, setTtsEnabled]       = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);

  const [conversations, setConversations] = useState<any[]>([]);
  const [attachments, setAttachments]     = useState<Attachment[]>([]);
  const fileInputRef                      = useRef<HTMLInputElement>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const activeConvIdRef = useRef<string | null>(null);

  const [selectedProviderId, setSelectedProviderId] = useState<string>();
  const [selectedModelId, setSelectedModelId] = useState<string>();
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(4096);

  const [activeView, setActiveView]       = useState<'chat' | 'tasks' | 'agents' | 'memory' | 'network' | 'analytics' | 'projects' | 'plugins' | 'mcp' | 'automations' | 'activity'>('chat');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [chatSearchOpen, setChatSearchOpen]         = useState(false);
  const [bookmarkedMsgIds, setBookmarkedMsgIds]     = useState<Set<string>>(new Set());
  const [highlightedMsgIdx, setHighlightedMsgIdx]   = useState<number | null>(null);
  const { addToast } = useToast();
  const [agents, setAgents]               = useState<any[]>([]);
  const [activeTasks, setActiveTasks]     = useState<{ tasks: any[]; subtasks: any[] }>({ tasks: [], subtasks: [] });
  const [memories, setMemoriesList]       = useState<any[]>([]);
  const [swarmClients, setSwarmClients]   = useState<string[]>([]);
  const [activeSlaves, setActiveSlaves]   = useState<Set<string>>(new Set());
  const [isListening, setIsListening]     = useState(false);
  const [eyeActive, setEyeActive]         = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifCounter = React.useRef(0);

  const addNotification = React.useCallback((n: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => {
    setNotifications(prev => [{
      ...n, id: `notif-${++notifCounter.current}`, read: false, timestamp: Date.now()
    }, ...prev].slice(0, 50));
  }, []);

  const messagesEndRef   = useRef<HTMLDivElement>(null);
  const activityEndRef   = useRef<HTMLDivElement>(null);
  const recognitionRef   = useRef<any>(null);

  const [mentionState, setMentionState] = useState<{ active: boolean; type: 'slash' | 'agent' | null; query: string }>({ active: false, type: null, query: '' });
  const [mentionIndex, setMentionIndex] = useState(0);

  const SLASH_COMMANDS: AutocompleteOption[] = [
    { id: 'clear', label: '/clear', description: 'Clear current conversation', icon: XCircle, color: '#ffffff' },
    { id: 'new', label: '/new', description: 'Start a new chat', icon: Plus, color: '#ffffff' },
    { id: 'plan', label: '/plan', description: 'Force orchestrator to only plan', icon: Brain, color: '#ffffff' },
    { id: 'settings', label: '/settings', description: 'Toggle settings menu', icon: Settings, color: '#ffffff' },
    { id: 'model', label: '/model', description: 'Change LLM model', icon: Brain, color: '#ffffff' },
    { id: 'agent', label: '/agent', description: 'Configure agent', icon: Bot, color: '#ffffff' },
    { id: 'search', label: '/search', description: 'Search workspace', icon: Search, color: '#ffffff' },
    { id: 'browser', label: '/browser', description: 'Open browser workspace', icon: Globe, color: '#ffffff' },
    { id: 'research', label: '/research', description: 'Start deep research', icon: FileText, color: '#ffffff' },
    { id: 'file', label: '/file', description: 'Attach or create file', icon: FileText, color: '#ffffff' },
    { id: 'task', label: '/task', description: 'Create a new task', icon: CheckCircle, color: '#ffffff' },
    { id: 'schedule', label: '/schedule', description: 'Schedule an automation', icon: Clock, color: '#ffffff' },
    { id: 'memory', label: '/memory', description: 'Search memory', icon: Brain, color: '#ffffff' },
    { id: 'export', label: '/export', description: 'Export artifacts or chats', icon: Database, color: '#ffffff' }
  ];

  const mentionOptions: AutocompleteOption[] = [
    ...agents.map(a => {
      const meta = SLAVE_META[a.id] || { icon: Bot, tier: 2, color: '#ffffff' };
      return {
        id: a.id,
        label: `@${a.name.toLowerCase().replace(/\s+/g, '_')}`,
        description: a.description,
        icon: meta.icon,
        color: meta.color
      };
    }),
    { id: 'ctx-project', label: '@project', description: 'Reference a project', icon: FolderOpen, color: '#ffffff' },
    { id: 'ctx-file', label: '@file', description: 'Reference a file', icon: FileText, color: '#ffffff' },
    { id: 'ctx-chat', label: '@chat', description: 'Reference a conversation', icon: MessageSquare, color: '#ffffff' },
    { id: 'ctx-task', label: '@task', description: 'Reference a task', icon: CheckSquare, color: '#ffffff' },
    { id: 'ctx-artifact', label: '@artifact', description: 'Reference an artifact', icon: Layers, color: '#ffffff' },
    { id: 'ctx-memory', label: '@memory', description: 'Reference a memory', icon: Brain, color: '#ffffff' },
    { id: 'ctx-connection', label: '@connection', description: 'Reference a connection', icon: Link, color: '#ffffff' },
  ];
  
  const activeOptions = mentionState.active 
    ? (mentionState.type === 'slash' 
        ? SLASH_COMMANDS.filter(c => c.label.toLowerCase().includes(mentionState.query.toLowerCase()))
        : mentionOptions.filter(a => a.label.toLowerCase().includes(mentionState.query.toLowerCase())))
    : [];
  
  useEffect(() => { setMentionIndex(0); }, [mentionState.query]);

  const handleMentionSelect = (option: AutocompleteOption) => {
    const cursor = intent.lastIndexOf(mentionState.query);
    if (cursor !== -1) {
      const newIntent = intent.slice(0, cursor) + option.label + ' ' + intent.slice(cursor + mentionState.query.length);
      setIntent(newIntent);
    }
    setMentionState({ active: false, type: null, query: '' });
  };

  // ── Speech ─────────────────────────────────────────────────────────────────
  const speak = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    const clean = text.replace(/\[.*?\]/g, '').replace(/https?:\/\/\S+/g, 'link').slice(0, 300);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = 1.05;
    const v = window.speechSynthesis.getVoices().find(v => v.lang === 'en-US');
    if (v) utt.voice = v;
    window.speechSynthesis.speak(utt);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else             { recognitionRef.current.start(); setIsListening(true); }
  };

  const processFiles = async (files: FileList | File[]) => {
    const newAttachments: Attachment[] = [];
    for (const file of Array.from(files)) {
      const type = file.type.startsWith('image/') ? 'image' : 'text';
      const att: Attachment = { id: Math.random().toString(36).slice(2), file, type };
      
      if (type === 'image') {
        att.previewUrl = URL.createObjectURL(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => att.content = reader.result as string;
      } else {
        const text = await file.text();
        att.content = text;
      }
      newAttachments.push(att);
    }
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files?.length) {
      e.preventDefault();
      processFiles(e.clipboardData.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // ── Scroll helpers ─────────────────────────────────────────────────────────
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { activityEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activity]);

  // ── Sync ref ───────────────────────────────────────────────────────────────
  useEffect(() => { activeConvIdRef.current = activeConversationId; }, [activeConversationId]);

  // ── Global keyboard shortcuts ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'k') { e.preventDefault(); setShowCommandPalette(p => !p); }
      if (ctrl && e.key === 'n') { e.preventDefault(); handleNewChat(); }
      if (ctrl && e.key === ',') { e.preventDefault(); setShowSettings(true); }
      if (ctrl && e.key === 'f') { e.preventDefault(); setChatSearchOpen(p => !p); }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowSettings(false);
        setChatSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Initialise ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // @ts-ignore
    const cleanup = window.api.notifications?.onNotification?.((notif: any) => {
      addNotification(notif);
      if (notif.type === 'critical' || notif.type === 'error' || notif.type === 'warning') {
        addToast(notif.title, 'error');
      } else if (notif.type === 'approval') {
        addToast(notif.title, 'info');
      } else {
        addToast(notif.title, 'success');
      }
    });
    return () => cleanup?.();
  }, [addNotification, addToast]);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (e: any) => {
        setIntent(p => p ? p + ' ' + e.results[0][0].transcript : e.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend   = () => setIsListening(false);
    }

    // @ts-ignore
    window.api.getConfig().then(cfg => { setTtsEnabled(cfg.ttsEnabled || false); });
    // @ts-ignore
    window.api.getAgents?.().then((d: any[]) => setAgents(d)).catch(() => {});

    // Load Conversations
    const loadConversations = async () => {
      // @ts-ignore
      if (!window.api.chat) return;
      // @ts-ignore
      const convs = await window.api.chat.getConversations();
      setConversations(convs);
      
      if (convs.length > 0) {
        setActiveConversationId(convs[0].id);
      } else {
        // @ts-ignore
        const newId = await window.api.chat.createConversation('New Session');
        setActiveConversationId(newId);
        setConversations([{ id: newId, title: 'New Session' }]);
      }
    };
    loadConversations();

    // Task update stream
    // @ts-ignore
    if (window.api.onTaskUpdate) {
      // @ts-ignore
      window.api.onTaskUpdate((msg: string) => {
        const ts = Date.now();
        setMessages(prev => [...prev, { role: 'agent', text: msg, ts }]);
        setActivity(prev => [...prev.slice(-199), { text: msg, ts, slaveId: extractSlaveId(msg) }]);
        
        // @ts-ignore
        if (activeConvIdRef.current && window.api.chat) {
          // @ts-ignore
          window.api.chat.saveMessage(activeConvIdRef.current, 'agent', msg).catch(() => {});
        }

        // Track active slaves from messages
        const sid = extractSlaveId(msg);
        if (sid) {
          setActiveSlaves(prev => { const s = new Set(prev); s.add(sid); return s; });
          if (msg.toLowerCase().includes('completed') || msg.toLowerCase().includes('failed')) {
            setTimeout(() => setActiveSlaves(prev => { const s = new Set(prev); s.delete(sid); return s; }), 2000);
          }
        }

        // Fire in-app notifications on key events
        if (/task.*completed|finished successfully/i.test(msg)) {
          addNotification({ type: 'task_complete', title: 'Task Completed', message: msg.slice(0, 100) });
        } else if (/failed|error/i.test(msg)) {
          addNotification({ type: 'task_failed', title: 'Task Failed', message: msg.slice(0, 100) });
        } else if (/activated|dispatched/i.test(msg) && sid) {
          addNotification({ type: 'agent_active', title: `${sid} Activated`, message: msg.slice(0, 80) });
        }

        if (/finished|failed|error|dispatched/i.test(msg)) speak(msg);
      });
    }

    // Eye active indicator
    // @ts-ignore
    if (window.api.onEyeActive) {
      // @ts-ignore
      window.api.onEyeActive((active: boolean) => setEyeActive(active));
    }
  }, []);

  // ── Load messages when conversation changes ────────────────────────────────
  useEffect(() => {
    if (!activeConversationId) return;
    const loadMessages = async () => {
      // @ts-ignore
      if (!window.api.chat) return;
      // @ts-ignore
      const msgs = await window.api.chat.getMessages(activeConversationId);
      if (msgs.length === 0) {
        const welcome = 'Slave OS online. All 15 agents standing by. What is your objective?';
        setMessages([{ role: 'agent', text: welcome, ts: Date.now() }]);
        // @ts-ignore
        window.api.chat.saveMessage(activeConversationId, 'agent', welcome).catch(() => {});
      } else {
        setMessages(msgs.map((m: any) => ({
          id: m.id,
          role: m.role,
          text: m.content,
          ts: m.createdAt
        })));
      }
    };
    loadMessages();
  }, [activeConversationId]);

  // ── Data polling ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeView === 'tasks') {
      const poll = () => {
        // @ts-ignore
        window.api.getActiveTasks?.().then((d: any) => setActiveTasks(d)).catch(() => {});
      };
      poll();
      const iv = setInterval(poll, 2000);
      return () => clearInterval(iv);
    }
    if (activeView === 'agents') {
      // @ts-ignore
      window.api.getAgents?.().then((d: any[]) => setAgents(d)).catch(() => {});
    }
    if (activeView === 'memory') {
      // @ts-ignore
      Promise.all([window.api.getMemories?.('system') || [], window.api.getMemories?.('task') || []])
        .then(([s, t]) => setMemoriesList([...s, ...t])).catch(() => {});
    }
    if (activeView === 'network') {
      const poll = () => {
        // @ts-ignore
        window.api.getSwarmClients?.().then((d: string[]) => setSwarmClients(d)).catch(() => {});
      };
      poll();
      const iv = setInterval(poll, 2000);
      return () => clearInterval(iv);
    }
  }, [activeView]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const extractSlaveId = (msg: string): string | undefined => {
    const m = msg.match(/\[([\w_]+)\]/);
    return m ? m[1] : undefined;
  };

  const saveSettings = async () => {
    // @ts-ignore
    await window.api.setConfig({ ttsEnabled });
    setShowSettings(false);
  };

  // Programmatic submit (for edit/regenerate)
  const handleSubmitText = (text: string) => {
    setIntent(text);
    // Use a small timeout so setIntent flushes before handleSubmit reads it
    setTimeout(() => {
      setMessages(p => [...p, { role: 'user', text, ts: Date.now() }]);
      setIntent('');
      // Re-use the main submit path
      (document.querySelector('form[data-chat-form]') as HTMLFormElement)?.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 0);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!intent.trim() && attachments.length === 0) || isProcessing) return;

    if (intent.trim() === '/clear') {
      setMessages([]);
      setIntent('');
      return;
    }
    if (intent.trim() === '/new') {
      handleNewChat();
      setIntent('');
      return;
    }
    if (intent.trim() === '/settings') {
      setShowSettings(true);
      setIntent('');
      return;
    }

    if (!selectedProviderId || !selectedModelId) {
      setMessages(p => [...p, { role: 'system', text: '⚠ Please select an LLM model first.', ts: Date.now() }]);
      return;
    }
    
    let finalUserText = intent;
    const imageAttachments: any[] = [];

    if (attachments.length > 0) {
      const textContexts = attachments
        .filter(a => a.type === 'text' && a.content)
        .map(a => `[Attached File: ${a.file.name}]\n\`\`\`\n${a.content}\n\`\`\`\n[End File]`)
        .join('\n\n');
      
      if (textContexts) {
        finalUserText = intent.trim() ? `${textContexts}\n\n${intent}` : textContexts;
      }

      attachments.filter(a => a.type === 'image').forEach(a => {
        if (a.content) imageAttachments.push({ type: 'image', data: a.content });
      });
    }

    setIntent('');
    setAttachments([]);
    setMessages(p => [...p, { role: 'user', text: finalUserText, ts: Date.now() }]);
    
    let convId = activeConversationId;
    let isNewChat = false;
    // @ts-ignore
    if (!convId && window.api.chat) {
      isNewChat = true;
      // @ts-ignore
      convId = await window.api.chat.createConversation('New Session');
      setActiveConversationId(convId);
      setConversations(p => [{ id: convId, title: 'New Session' }, ...p]);
    }
    // @ts-ignore
    if (convId && window.api.chat) {
      // @ts-ignore
      await window.api.chat.saveMessage(convId, 'user', finalUserText);
      
      // Auto-generate title in the background if this is a new chat
      if (isNewChat) {
        // @ts-ignore
        window.api.chat.generateTitle(selectedProviderId, selectedModelId, finalUserText).then((newTitle: string) => {
          // @ts-ignore
          window.api.chat.renameConversation(convId, newTitle).then(() => {
            setConversations(p => p.map(c => c.id === convId ? { ...c, title: newTitle } : c));
          });
        });
      }
    }

    setIsProcessing(true);
    try {
      // @ts-ignore
      const res = await window.api.submitIntent(finalUserText, { 
        providerId: selectedProviderId, 
        modelId: selectedModelId,
        attachments: imageAttachments.length > 0 ? imageAttachments : undefined,
        temperature,
        maxTokens
      });
      if (!res.success) {
        setMessages(p => [...p, { role: 'system', text: `Failed: ${res.error}`, ts: Date.now() }]);
      } else {
        setCurrentTaskId(res.taskId);
      }
    } catch (err: any) {
      setMessages(p => [...p, { role: 'system', text: `IPC error: ${err.message}`, ts: Date.now() }]);
    } finally {
      setIsProcessing(false);
      setCurrentTaskId(null);
    }
  };

  const handleStop = async () => {
    if (currentTaskId) {
      // @ts-ignore
      await window.api.abortTask(currentTaskId);
      setIsProcessing(false);
      setCurrentTaskId(null);
    }
  };

  const handleDeleteMessage = async (msgId: string | undefined, index: number) => {
    if (!msgId) return;
    setMessages(p => p.filter((_, i) => i !== index));
    // @ts-ignore
    if (window.api.chat) await window.api.chat.deleteMessage(msgId);
  };

  const handleNewChat = async () => {
    // @ts-ignore
    if (!window.api.chat) return;
    // @ts-ignore
    const newId = await window.api.chat.createConversation('New Session');
    setActiveConversationId(newId);
    setConversations(p => [{ id: newId, title: 'New Session' }, ...p]);
    setMessages([]);
  };

  const handleSwitchChat = (id: string) => {
    if (id === activeConversationId) return;
    setActiveConversationId(id);
    setMessages([]);
  };

  const handleDeleteChat = async (id: string) => {
    // @ts-ignore
    if (!window.api.chat) return;
    // @ts-ignore
    await window.api.chat.deleteConversation(id);
    setConversations(p => p.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setMessages([]);
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    // @ts-ignore
    if (!window.api.chat) return;
    // @ts-ignore
    await window.api.chat.renameConversation(id, newTitle);
    setConversations(p => p.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // ── Grouped agents by tier ─────────────────────────────────────────────────
  const agentsByTier = [0, 1, 2].map(tier =>
    agents.filter(a => (SLAVE_META[a.id]?.tier ?? 2) === tier)
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--color-background)', color: 'var(--color-text)', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", overflow: 'hidden' }}>

      {/* ── TOP STATUS BAR ─────────────────────────────────────────────── */}
      <div style={{ height: '3.5rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)', WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 8px #ffffff', animation: 'pulse 2s infinite' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.12em', color: '#ffffff' }}>SLAVE OS</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 4 }}>v2.0.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          {eyeActive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#ffffff' }}>
              <Eye size={12} />
              <span style={{ animation: 'pulse 1s infinite' }}>WATCHING</span>
            </div>
          )}
          {isListening && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#ffffff' }}>
              <Mic size={12} />
              <span style={{ animation: 'pulse 1s infinite' }}>LISTENING</span>
            </div>
          )}
          {activeSlaves.size > 0 && (
            <div style={{ fontSize: 11, color: '#e5e5e5', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />
              {activeSlaves.size} active
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: swarmClients.length ? '#ffffff' : 'rgba(255,255,255,0.3)' }}>
            <Globe size={11} />
            {swarmClients.length ? `${swarmClients.length} nodes` : 'Local'}
          </div>
          <button onClick={() => setTtsEnabled(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ttsEnabled ? '#ffffff' : 'rgba(255,255,255,0.25)', padding: '0.25rem' }}>
            {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ModelSelector 
              selectedProviderId={selectedProviderId} 
              selectedModelId={selectedModelId} 
              onSelect={(pid, mid) => { setSelectedProviderId(pid); setSelectedModelId(mid); }} 
            />
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
              <Settings size={14} />
            </button>
            <NotificationCenter
              notifications={notifications}
              onMarkAllRead={() => setNotifications(p => p.map(n => ({ ...n, read: true })))}
              onClear={() => setNotifications([])}
              onDismiss={id => setNotifications(p => p.filter(n => n.id !== id))}
              onAction={(id, actionId) => {
                if (actionId.startsWith('takeover:')) {
                  const slaveId = actionId.split(':')[1];
                  setTakeoverTarget(slaveId || 'Unknown Agent');
                } else {
                  // @ts-ignore
                  window.api.notifications.action(id, actionId);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── LEFT SIDEBAR — SLAVE ROSTER ──────────────────────────────── */}
        <div style={{ width: 220, borderRight: '1px solid var(--color-border)', background: 'var(--color-background)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
          {/* Nav items */}
          <div style={{ padding: '8px 8px 0' }}>
            {[
              { id: 'home',      label: 'Home',         icon: Home,          devOnly: false },
              { id: 'chat',      label: 'Chat',         icon: MessageSquare, devOnly: false },
              { id: 'projects',  label: 'Projects',     icon: FolderOpen,    devOnly: false },
              { id: 'tasks',     label: 'Tasks',        icon: CheckSquare,   devOnly: false },
              { id: 'files',     label: 'Files',        icon: FileText,      devOnly: false },
              { id: 'activity',  label: 'Activity',     icon: Activity,      devOnly: false },
              { id: 'agents',    label: 'Agents',       icon: Cpu,           devOnly: true },
              { id: 'browser',   label: 'Browser',      icon: Globe,         devOnly: true },
              { id: 'apps',      label: 'Apps',         icon: Layout,        devOnly: true },
              { id: 'automations',label: 'Automations', icon: Zap,           devOnly: true },
              { id: 'knowledge', label: 'Knowledge',    icon: Book,          devOnly: true },
              { id: 'mcp',       label: 'MCP',          icon: Server,        devOnly: true },
              { id: 'plugins',   label: 'Plugins',      icon: Layers,        devOnly: true },
              { id: 'connections',label: 'Connections', icon: Link,          devOnly: true },
            ].filter(item => developerMode || !item.devOnly).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as any)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                  borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  background: activeView === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: activeView === id ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.15s', marginBottom: 2, textAlign: 'left'
                }}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '10px 12px' }} />

          {/* Chat History (Only visible in chat view, or always visible above roster) */}
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conversations</span>
            <button onClick={handleNewChat} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '0.2rem', display: 'flex' }} aria-label="New Chat">
              <Plus size={14} />
            </button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
            {conversations.map(conv => (
              <ChatSidebarItem
                key={conv.id}
                id={conv.id}
                title={conv.title}
                isActive={activeConversationId === conv.id}
                onClick={() => handleSwitchChat(conv.id)}
                onDelete={() => handleDeleteChat(conv.id)}
                onRename={(newTitle) => handleRenameChat(conv.id, newTitle)}
              />
            ))}
            {conversations.length === 0 && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', padding: 8, textAlign: 'center' }}>No chats yet.</div>
            )}
          </div>


        </div>

        {/* ── CENTER PANEL ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: 'var(--color-background)' }}>

          {/* ── CHAT VIEW ─────────────────────────────────────────────── */}
          {activeView === 'chat' && (
            <>
              {/* Search overlay */}
              <div style={{ position: 'relative' }}>
                <ChatSearchBar
                  open={chatSearchOpen}
                  onClose={() => setChatSearchOpen(false)}
                  messages={messages}
                  onJumpTo={idx => {
                    setHighlightedMsgIdx(idx);
                    const el = document.getElementById(`msg-${idx}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => setHighlightedMsgIdx(null), 2000);
                  }}
                />
              </div>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.map((msg, i) => {
                  // Detect autonomous loop phase prefixes
                  const phaseMap: Record<string, { label: string; color: string; bg: string }> = {
                    '🧠 [PLANNING]':    { label: 'PLANNING',    color: '#ffffff', bg: 'rgba(255,255,255,0.08)'  },
                    '⚡ [EXECUTING]':   { label: 'EXECUTING',   color: '#e5e5e5', bg: 'rgba(255,255,255,0.08)'  },
                    '🔍 [VERIFYING]':   { label: 'VERIFYING',   color: '#cccccc', bg: 'rgba(255,255,255,0.08)'  },
                    '🔄 [CORRECTING]':  { label: 'CORRECTING',  color: '#b3b3b3', bg: 'rgba(255,255,255,0.08)'  },
                    '✅ [COMPLETED]':   { label: 'COMPLETED',   color: '#ffffff', bg: 'rgba(255,255,255,0.08)'  },
                    '❌ [FAILED]':      { label: 'FAILED',      color: '#ffffff', bg: 'rgba(255,255,255,0.08)'   },
                  };
                  const phaseKey = Object.keys(phaseMap).find(k => msg.text.startsWith(k));
                  const phase = phaseKey ? phaseMap[phaseKey] : null;
                  const bodyText = phaseKey ? msg.text.slice(phaseKey.length).trim() : msg.text;

                  return (
                    <div
                      key={i}
                      id={`msg-${i}`}
                      onMouseEnter={() => setHoveredMsgIndex(i)}
                      onMouseLeave={() => setHoveredMsgIndex(null)}
                      style={{
                        display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                        gap: 10, alignItems: 'flex-start', position: 'relative',
                        borderRadius: 10,
                        outline: highlightedMsgIdx === i ? '2px solid rgba(168,85,247,0.7)' : 'none',
                        transition: 'outline 0.3s',
                      }}
                    >
                      {msg.role !== 'user' && (
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: phase ? `${phase.color}18` : msg.role === 'system' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${phase ? `${phase.color}40` : msg.role === 'system' ? 'rgba(239,68,68,0.3)' : 'rgba(168,85,247,0.3)'}` }}>
                          {msg.role === 'system' ? <XCircle size={14} color="#ffffff" /> : <Bot size={14} color={phase ? phase.color : '#ffffff'} />}
                        </div>
                      )}
                      <div style={{
                        maxWidth: msg.role === 'user' ? '70%' : '85%', borderRadius: 12, overflow: 'hidden',
                        background: phase ? 'var(--color-surface)' : msg.role === 'user' ? 'var(--color-surface)' : 'transparent',
                        border: phase ? '1px solid var(--color-border)' : 'none',
                        color: 'var(--color-text)'
                      }}>
                        {phase && (
                          <div style={{ padding: '6px 12px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-muted)' }}>{phase.label}</span>
                          </div>
                        )}
                        <div style={{ padding: msg.role === 'agent' && !phase ? '0 14px' : '10px 14px' }}>
                          {msg.role === 'agent' ? (
                            <MarkdownRenderer content={bodyText} />
                          ) : (
                            <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{bodyText}</span>
                          )}
                        </div>
                      </div>

                      {/* Message Actions */}
                      {hoveredMsgIndex === i && (
                        <MessageActions
                          messageText={msg.text}
                          isUser={msg.role === 'user'}
                          isBookmarked={bookmarkedMsgIds.has(msg.id ?? String(i))}
                          onBookmark={() => {
                            const id = msg.id ?? String(i);
                            setBookmarkedMsgIds(prev => {
                              const s = new Set(prev);
                              s.has(id) ? s.delete(id) : s.add(id);
                              return s;
                            });
                          }}
                          onCopy={() => navigator.clipboard.writeText(msg.text)}
                          onRegenerate={msg.role === 'agent' ? () => {
                            // Re-submit the last user message to regenerate
                            const lastUser = [...messages].reverse().find(m => m.role === 'user');
                            if (lastUser) handleSubmitText(lastUser.text);
                          } : undefined}
                          onEdit={msg.role === 'user' ? (newText) => {
                            // Remove messages from this index onward, then re-submit
                            setMessages(prev => prev.slice(0, i));
                            handleSubmitText(newText);
                          } : undefined}
                        />
                      )}
                    </div>
                  );
                })}
                {isProcessing && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168,85,247,0.3)' }}>
                      <Bot size={14} color="#ffffff" />
                    </div>
                    <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div 
                onDragOver={(e) => e.preventDefault()} 
                onDrop={handleDrop}
                style={{ padding: '16px 15% 32px', background: 'var(--color-background)' }}
              >
                {takeoverTarget && (
                  <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Zap size={16} color="#3b82f6" />
                      <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>You are controlling {takeoverTarget}.</span>
                    </div>
                    <button 
                      onClick={() => setTakeoverTarget(null)}
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '6px 12px', color: '#ffffff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Return Control
                    </button>
                  </div>
                )}
                
                <form data-chat-form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'box-shadow 0.3s', overflow: 'hidden' }}>
                  
                  {/* Attachment Previews */}
                  {attachments.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, padding: '12px 16px 4px', overflowX: 'auto' }}>
                      {attachments.map(att => (
                        <div key={att.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', minWidth: 0, maxWidth: 180 }}>
                          {att.type === 'image' && att.previewUrl ? (
                            <img src={att.previewUrl} alt="preview" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} />
                          ) : (
                            <FileText size={16} color="#e5e5e5" />
                          )}
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{att.file.name}</span>
                          <button type="button" onClick={() => removeAttachment(att.id)} style={{ position: 'absolute', top: -6, right: -6, background: '#ffffff', border: 'none', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '6px 6px 6px 12px' }}>
                    <textarea
                      value={intent}
                      onChange={e => {
                        const val = e.target.value;
                        setIntent(val);
                        
                        const cursor = e.target.selectionStart || 0;
                        const textBeforeCursor = val.slice(0, cursor);
                        const words = textBeforeCursor.split(/\s/);
                        const currentWord = words[words.length - 1];
                        
                        if (currentWord.startsWith('/')) {
                          setMentionState({ active: true, type: 'slash', query: currentWord });
                        } else if (currentWord.startsWith('@')) {
                          setMentionState({ active: true, type: 'agent', query: currentWord });
                        } else {
                          setMentionState({ active: false, type: null, query: '' });
                        }
                      }}
                      onKeyDown={e => {
                        if (mentionState.active && activeOptions.length > 0) {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setMentionIndex(i => (i + 1) % activeOptions.length);
                            return;
                          }
                          if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setMentionIndex(i => (i - 1 + activeOptions.length) % activeOptions.length);
                            return;
                          }
                          if (e.key === 'Enter' || e.key === 'Tab') {
                            e.preventDefault();
                            handleMentionSelect(activeOptions[mentionIndex]);
                            return;
                          }
                          if (e.key === 'Escape') {
                            setMentionState({ active: false, type: null, query: '' });
                            return;
                          }
                        }
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      onPaste={handlePaste}
                      placeholder={isProcessing ? 'Agents working...' : 'Give me an objective... (Drop files or paste images)'}
                      disabled={isProcessing}
                      rows={Math.min(5, intent.split('\n').length)}
                      style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#ffffff', padding: '4px 0', resize: 'none', lineHeight: 1.5, fontFamily: 'inherit' }}
                    />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', position: 'relative' }}>
                        {mentionState.active && activeOptions.length > 0 && (
                          <AutocompletePopover 
                            options={activeOptions} 
                            selectedIndex={mentionIndex} 
                            onSelect={handleMentionSelect} 
                            position={{ bottom: '100%', left: 0 }} 
                          />
                        )}
                        <ModelSelector 
                          selectedProviderId={selectedProviderId} 
                          selectedModelId={selectedModelId} 
                          onSelect={(p, m) => { setSelectedProviderId(p); setSelectedModelId(m); }} 
                        />
                        <AdvancedControls 
                          temperature={temperature} 
                          setTemperature={setTemperature} 
                          maxTokens={maxTokens} 
                          setMaxTokens={setMaxTokens} 
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <input 
                          type="file" 
                          multiple 
                          ref={fileInputRef} 
                          style={{ display: 'none' }} 
                          onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ''; }}
                        />
                        <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: '8px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>
                          <Paperclip size={16} />
                        </button>
                        <button type="button" onClick={toggleListening} style={{ padding: '8px', borderRadius: 10, border: 'none', background: isListening ? 'rgba(239,68,68,0.15)' : 'transparent', cursor: 'pointer', color: isListening ? '#ffffff' : 'rgba(255,255,255,0.3)', transition: 'all 0.2s' }}>
                          {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                        </button>
                        {isProcessing ? (
                          <button type="button" onClick={handleStop} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--color-border)', cursor: 'pointer', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, transition: 'all 0.2s' }}>
                            <X size={14} /> Stop
                          </button>
                        ) : (
                          <button type="submit" disabled={(!intent.trim() && attachments.length === 0)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: (intent.trim() || attachments.length > 0) ? 'var(--color-primary)' : 'var(--color-border)', cursor: (intent.trim() || attachments.length > 0) ? 'pointer' : 'not-allowed', color: (intent.trim() || attachments.length > 0) ? 'var(--color-background)' : 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
                            <Send size={14} /> Send
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* ── TASK GRAPH VIEW ──────────────────────────────────────── */}
          {activeView === 'tasks' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Task Graph</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Live execution DAG — updates every 2 seconds.</p>
              {activeTasks.tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No active tasks. Submit an intent to begin.</div>
              ) : (
                activeTasks.tasks.map((task: any) => {
                  const subs = activeTasks.subtasks.filter((s: any) => s.taskId === task.id);
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => setRightPanelContext({ type: 'task', id: task.id })}
                      style={{ marginBottom: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20, cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: task.status === 'completed' ? '#ffffff' : task.status === 'failed' ? '#ffffff' : '#cccccc', boxShadow: `0 0 6px ${task.status === 'completed' ? '#ffffff' : task.status === 'failed' ? '#ffffff' : '#cccccc'}` }} />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{task.objective?.slice(0, 80) || task.id}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{task.id.slice(0, 8)}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {subs.map((sub: any) => {
                          const meta = SLAVE_META[sub.assignedSlave] || { icon: Bot, color: '#64748b', tier: 1 };
                          const Icon = meta.icon;
                          const statusColor = sub.status === 'completed' ? '#ffffff' : sub.status === 'failed' ? '#ffffff' : sub.status === 'running' ? '#e5e5e5' : 'rgba(255,255,255,0.2)';
                          return (
                            <div key={sub.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${statusColor}40`, borderRadius: 10, padding: '10px 14px', minWidth: 140 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <Icon size={12} color={meta.color} />
                                <span style={{ fontSize: 10, fontWeight: 600, color: meta.color }}>{sub.assignedSlave?.replace('_slave', '').toUpperCase()}</span>
                              </div>
                              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, marginBottom: 8 }}>{sub.objective?.slice(0, 60)}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                {sub.status === 'running' ? <Loader size={10} color={statusColor} style={{ animation: 'spin 1s linear infinite' }} /> : sub.status === 'completed' ? <CheckCircle size={10} color={statusColor} /> : sub.status === 'failed' ? <XCircle size={10} color={statusColor} /> : <div style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${statusColor}` }} />}
                                <span style={{ fontSize: 10, color: statusColor }}>{sub.status}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeView === 'agents' && (
            <AgentWorkforceView
              agents={agents}
              activeSlaves={activeSlaves}
              slaveMeta={SLAVE_META as any}
              onAgentClick={(id) => setRightPanelContext({ type: 'agent', id })}
            />
          )}
          {activeView === 'mcp' && <McpView />}
          {activeView === 'plugins' && <PluginMarketplace />}
          {activeView === 'memory' && <MemoryBrowser />}

          {/* ── ANALYTICS VIEW ───────────────────────────────────────── */}
          {activeView === 'analytics' && <AnalyticsDashboard />}

          {/* ── PROJECTS VIEW ────────────────────────────────────────── */}
          {activeView === 'projects' && (
            <ProjectsView />
          )}

          {/* ── PLUGINS VIEW ─────────────────────────────────────────── */}
          {activeView === 'plugins' && <PluginMarketplace />}

          {/* ── ACTIVITY VIEW ────────────────────────────────────────── */}
          {activeView === 'activity' && <ActivityCenter />}

          {/* ── AUTOMATIONS VIEW ─────────────────────────────────────── */}
          {activeView === 'automations' && <AutomationsView />}

          {/* ── NETWORK VIEW ─────────────────────────────────────────── */}
          {activeView === 'network' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Swarm Network</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Distributed execution topology.</p>
              <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 8px #ffffff' }} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Master Node (This Machine)</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>:8080</span>
                </div>
              </div>
              {swarmClients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>No remote workers connected. Start a worker on another machine to expand the swarm.</div>
              ) : (
                swarmClients.map((id, i) => (
                  <div key={i} style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, padding: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e5e5e5', boxShadow: '0 0 6px #e5e5e5' }} />
                    <Globe size={12} color="#e5e5e5" />
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>Worker {id.slice(0, 12)}...</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#ffffff' }}>Online</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT CONTEXT PANEL ──────────────────────────────────────── */}
        <RightPanel 
          context={rightPanelContext} 
          onClose={() => setRightPanelContext(null)} 
        />
      </div>

      {/* ── SETTINGS MODAL ────────────────────────────────────────────── */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        ttsEnabled={ttsEnabled}
        setTtsEnabled={setTtsEnabled}
        developerMode={developerMode}
        setDeveloperMode={setDeveloperMode}
      />

      {/* ── COMMAND PALETTE ───────────────────────────────────────────── */}
      <CommandPalette
        open={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={buildCommands({
          newChat: handleNewChat,
          clearChat: () => setMessages([]),
          openSettings: () => setShowSettings(true),
          setView: (v) => setActiveView(v as any),
          onSelectAgent: (id) => setRightPanelContext({ type: 'agent', id }),
          onSelectTask: (id) => setRightPanelContext({ type: 'task', id }),
        }, agents, activeTasks.tasks)}
      />

      {/* ── CSS ANIMATIONS ────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: rgba(168,85,247,0.3) transparent; }
        *::-webkit-scrollbar { width: 4px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.3); border-radius: 2px; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-4px); opacity: 1; } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { border-color: rgba(168,85,247,0.5) !important; }
      `}</style>
    </div>
  );
};

export default function AppRoot() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}

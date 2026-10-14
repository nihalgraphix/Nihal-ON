import React, { useState } from 'react';
import { useStudio } from './StudioContext';
import { ElementType } from './types';
import {
  Layers,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Search,
  Box,
  Type,
  Heading as HeadingIcon,
  MousePointer,
  Image as ImageIcon,
  LayoutGrid,
  Columns,
  Square,
  Sparkles,
  FileText,
  User,
  Briefcase,
  Wrench,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  Inbox,
  Palette,
  Check,
  RefreshCw,
  Send,
  Download
} from 'lucide-react';
import { PERSONAL_INFO, PROJECTS, SERVICES, SKILL_CATEGORIES, EXPERIENCE_LIST, TESTIMONIALS, FAQ_ITEMS } from '../data/portfolioData';

export const StudioLeftSidebar: React.FC = () => {
  const {
    mode,
    activeTab,
    elements,
    rootElementIds,
    selectedElementId,
    setSelectedElementId,
    renameElement,
    toggleHideElement,
    toggleLockElement,
    duplicateElement,
    deleteElement,
    addElement,
    designTokens,
    updateDesignToken
  } = useStudio();

  const [layerSearch, setLayerSearch] = useState('');
  const [expandedNodeIds, setExpandedNodeIds] = useState<Record<string, boolean>>({
    'navbar-container': true,
    'hero-section': true,
    'about-section': true,
    'projects-section': true,
    'contact-section': true,
    'footer-section': true
  });
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // CMS state tab
  const [cmsTab, setCmsTab] = useState<'profile' | 'projects' | 'services' | 'skills' | 'experience' | 'testimonials' | 'messages'>('profile');
  const [personalInfo, setPersonalInfo] = useState(PERSONAL_INFO);

  // Messages inbox state
  const [messages, setMessages] = useState<any[]>([]);
  const [webhookUrlInput, setWebhookUrlInput] = useState('https://script.google.com/macros/s/AKfycbxNW40z9ak0LQvvT5dMqa4UTGWNASouVnUHmcFu5G9A2CQsLTxOSfd_r56gX-GUrGHJ/exec');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  if (mode !== 'edit') return null;

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodeIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameInput(currentName);
  };

  const handleFinishRename = (id: string) => {
    if (renameInput.trim()) {
      renameElement(id, renameInput.trim());
    }
    setRenamingId(null);
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.webhookUrl) setWebhookUrlInput(data.webhookUrl);
      }
    } catch (e) {}
  };

  const testWebhook = async () => {
    setWebhookStatus('Testing Webhook Connection...');
    try {
      const res = await fetch('/api/sheets/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: webhookUrlInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWebhookStatus('✅ Google Sheets Webhook Verified!');
      } else {
        setWebhookStatus(`❌ Error: ${data.error || 'Failed'}`);
      }
    } catch (err: any) {
      setWebhookStatus(`❌ Network error: ${err.message}`);
    }
  };

  // Tree Node Renderer for Layers Panel
  const renderTreeNode = (id: string, depth = 0) => {
    const node = elements[id];
    if (!node) return null;

    if (layerSearch && !node.name.toLowerCase().includes(layerSearch.toLowerCase()) && !node.type.toLowerCase().includes(layerSearch.toLowerCase())) {
      const hasMatchingChild = node.children.some((cId) =>
        elements[cId]?.name.toLowerCase().includes(layerSearch.toLowerCase())
      );
      if (!hasMatchingChild) return null;
    }

    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedNodeIds[id];
    const isSelected = selectedElementId === id;

    return (
      <div key={id} className="select-none font-sans text-xs">
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedElementId(id);
          }}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-md transition-colors cursor-pointer my-0.5 ${
            isSelected
              ? 'bg-[#FF5A1F] text-black font-bold'
              : 'text-[#E4E4E7] hover:bg-[#27272A]'
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            {hasChildren ? (
              <button
                onClick={(e) => toggleExpand(id, e)}
                className={`p-0.5 rounded hover:bg-black/20 ${isSelected ? 'text-black' : 'text-[#A1A1AA]'}`}
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
            ) : (
              <span className="w-4" />
            )}

            <Box className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-black' : 'text-[#FF5A1F]'}`} />

            {renamingId === id ? (
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                onBlur={() => handleFinishRename(id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishRename(id);
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                className="bg-black text-white text-xs px-1 py-0.5 rounded border border-[#FF5A1F] outline-none w-28"
              />
            ) : (
              <span className="truncate max-w-[110px]">{node.name || node.type}</span>
            )}
          </div>

          <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100 text-black' : 'text-[#A1A1AA]'}`}>
            <button
              onClick={(e) => handleStartRename(id, node.name, e)}
              title="Rename Layer"
              className="p-1 hover:text-white"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleHideElement(id);
              }}
              title={node.hidden ? 'Show Element' : 'Hide Element'}
              className="p-1 hover:text-white"
            >
              {node.hidden ? <EyeOff className="h-3 w-3 text-red-400" /> : <Eye className="h-3 w-3" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLockElement(id);
              }}
              title={node.locked ? 'Unlock Element' : 'Lock Element'}
              className="p-1 hover:text-white"
            >
              {node.locked ? <Lock className="h-3 w-3 text-amber-400" /> : <Unlock className="h-3 w-3" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateElement(id);
              }}
              title="Duplicate"
              className="p-1 hover:text-white"
            >
              <Copy className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(id);
              }}
              title="Delete Element"
              className="p-1 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-[#27272A] ml-3">
            {node.children.map((childId) => renderTreeNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-80 bg-[#09090B] border-r border-[#27272A] h-[calc(100vh-3.5rem)] flex flex-col text-white select-none shrink-0 z-50">
      {/* 1. LAYERS TREE TAB */}
      {activeTab === 'layers' && (
        <div className="flex flex-col h-full p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-syne font-bold text-xs tracking-wider text-[#A1A1AA] uppercase flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[#FF5A1F]" />
              Website Hierarchy Tree
            </span>
            <button
              onClick={() => addElement('container', null, { name: 'New Section' })}
              className="p-1 rounded bg-[#18181B] border border-[#27272A] text-xs hover:text-[#FF5A1F] flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Section
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search layers..."
              value={layerSearch}
              onChange={(e) => setLayerSearch(e.target.value)}
              className="w-full bg-[#18181B] border border-[#27272A] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#71717A] outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {rootElementIds.map((id) => renderTreeNode(id, 0))}
          </div>
        </div>
      )}

      {/* 2. ADD ELEMENTS PALETTE TAB */}
      {activeTab === 'add' && (
        <div className="flex flex-col h-full p-3 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
            <span className="font-syne font-bold text-xs tracking-wider text-[#A1A1AA] uppercase flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-[#FF5A1F]" />
              Add Website Element
            </span>
          </div>

          {/* Basic Elements Category */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase">Basic Elements</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addElement('heading')}
                className="flex items-center gap-2 p-2 rounded.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs transition-colors text-left"
              >
                <HeadingIcon className="h-4 w-4 text-[#FF5A1F]" />
                <span>Heading</span>
              </button>

              <button
                onClick={() => addElement('paragraph')}
                className="flex items-center gap-2 p-2 rounded.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs transition-colors text-left"
              >
                <Type className="h-4 w-4 text-sky-400" />
                <span>Paragraph</span>
              </button>

              <button
                onClick={() => addElement('button')}
                className="flex items-center gap-2 p-2 rounded.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs transition-colors text-left"
              >
                <MousePointer className="h-4 w-4 text-emerald-400" />
                <span>Button</span>
              </button>

              <button
                onClick={() => addElement('image')}
                className="flex items-center gap-2 p-2 rounded.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs transition-colors text-left"
              >
                <ImageIcon className="h-4 w-4 text-amber-400" />
                <span>Image</span>
              </button>
            </div>
          </div>

          {/* Layout Containers */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase">Containers & Grid</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addElement('container', null, { name: 'Flex Container' })}
                className="flex items-center gap-2 p-2 rounded.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs transition-colors text-left"
              >
                <Square className="h-4 w-4 text-purple-400" />
                <span>Container</span>
              </button>

              <button
                onClick={() => addElement('grid', null, { name: '2 Column Grid', styles: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } })}
                className="flex items-center gap-2 p-2 rounded.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs transition-colors text-left"
              >
                <Columns className="h-4 w-4 text-pink-400" />
                <span>2 Col Grid</span>
              </button>
            </div>
          </div>

          {/* Content Components */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase">Content Blocks</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addElement('card', null, { name: 'Feature Card', content: 'Card Title\nDescription text goes here...' })}
                className="flex items-center gap-2 p-2 rounded.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs transition-colors text-left"
              >
                <LayoutGrid className="h-4 w-4 text-indigo-400" />
                <span>Feature Card</span>
              </button>

              <button
                onClick={() => addElement('badge', null, { name: 'Glow Pill Badge', content: '✦ New Release' })}
                className="flex items-center gap-2 p-2 rounded.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs transition-colors text-left"
              >
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span>Glow Badge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CMS CONTENT MANAGER TAB */}
      {activeTab === 'cms' && (
        <div className="flex flex-col h-full overflow-hidden p-3">
          <div className="flex items-center gap-1 bg-[#18181B] p-1 rounded-md border border-[#27272A] mb-3 overflow-x-auto text-[11px]">
            <button
              onClick={() => { setCmsTab('profile'); }}
              className={`px-2 py-1 rounded ${cmsTab === 'profile' ? 'bg-[#FF5A1F] text-black font-bold' : 'text-[#A1A1AA]'}`}
            >
              Profile
            </button>
            <button
              onClick={() => { setCmsTab('projects'); }}
              className={`px-2 py-1 rounded ${cmsTab === 'projects' ? 'bg-[#FF5A1F] text-black font-bold' : 'text-[#A1A1AA]'}`}
            >
              Projects
            </button>
            <button
              onClick={() => { setCmsTab('messages'); fetchMessages(); }}
              className={`px-2 py-1 rounded ${cmsTab === 'messages' ? 'bg-[#FF5A1F] text-black font-bold' : 'text-[#A1A1AA]'}`}
            >
              Inbox
            </button>
          </div>

          {cmsTab === 'profile' && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              <div>
                <label className="text-[10px] text-[#A1A1AA] uppercase">Full Name</label>
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded p-1.5 text-white outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A1A1AA] uppercase">Professional Title</label>
                <input
                  type="text"
                  value={personalInfo.title}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded p-1.5 text-white outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A1A1AA] uppercase">Email</label>
                <input
                  type="text"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded p-1.5 text-white outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A1A1AA] uppercase">Phone</label>
                <input
                  type="text"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded p-1.5 text-white outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>
          )}

          {cmsTab === 'projects' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {PROJECTS.map((p) => (
                <div key={p.id} className="p-2 bg-[#18181B] border border-[#27272A] rounded flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{p.title}</div>
                    <div className="text-[10px] text-[#A1A1AA]">{p.category} • {p.year}</div>
                  </div>
                  <span className="text-[10px] bg-[#FF5A1F]/20 text-[#FF5A1F] px-1.5 py-0.5 rounded font-mono">
                    {p.id}
                  </span>
                </div>
              ))}
            </div>
          )}

          {cmsTab === 'messages' && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              <div className="p-2 bg-[#18181B] border border-[#27272A] rounded space-y-2">
                <div className="font-bold text-[#FF5A1F] flex items-center justify-between">
                  <span>Google Sheets Webhook Sync</span>
                  <button onClick={testWebhook} className="text-[10px] bg-[#FF5A1F] text-black font-bold px-2 py-0.5 rounded">
                    Test Sync
                  </button>
                </div>
                <input
                  type="text"
                  value={webhookUrlInput}
                  onChange={(e) => setWebhookUrlInput(e.target.value)}
                  className="w-full bg-black border border-[#27272A] rounded p-1 text-[10px] font-mono text-[#A1A1AA]"
                />
                {webhookStatus && <div className="text-[10px] text-emerald-400 font-mono">{webhookStatus}</div>}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#A1A1AA] uppercase">Inbound Inquiry Messages ({messages.length})</span>
                {messages.length === 0 ? (
                  <div className="text-[#71717A] text-[11px] italic">No contact form messages recorded yet.</div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="p-2 bg-[#18181B] border border-[#27272A] rounded space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{m.firstName} {m.lastName}</span>
                        <span className="text-[9px] text-[#71717A]">{m.timestamp}</span>
                      </div>
                      <div className="text-[10px] text-[#FF5A1F]">{m.email} • {m.phone || 'N/A'}</div>
                      <p className="text-[11px] text-[#E4E4E7] bg-black/50 p-1.5 rounded">{m.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. DESIGN TOKENS TAB */}
      {activeTab === 'design-tokens' && (
        <div className="flex flex-col h-full overflow-y-auto p-3 space-y-4 text-xs">
          <div className="font-syne font-bold text-xs tracking-wider text-[#A1A1AA] uppercase flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-[#FF5A1F]" />
            Global Design Tokens
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#A1A1AA] uppercase">Brand Palette</span>
            {Object.entries(designTokens.colors).map(([key, value]) => {
              const valStr = String(value || '');
              return (
                <div key={key} className="flex items-center justify-between bg-[#18181B] p-1.5 rounded border border-[#27272A]">
                  <span className="text-[#E4E4E7] font-mono text-[11px]">{key}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={valStr.startsWith('#') ? valStr : '#FF5A1F'}
                      onChange={(e) => updateDesignToken('colors', key, e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                    />
                    <input
                      type="text"
                      value={valStr}
                      onChange={(e) => updateDesignToken('colors', key, e.target.value)}
                      className="w-20 bg-black border border-[#27272A] rounded text-[10px] text-[#A1A1AA] px-1 font-mono"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ASSETS TAB */}
      {activeTab === 'assets' && (
        <div className="flex flex-col h-full overflow-y-auto p-3 space-y-3 text-xs">
          <div className="font-syne font-bold text-xs tracking-wider text-[#A1A1AA] uppercase flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-[#FF5A1F]" />
            Asset Library
          </div>
          <p className="text-[11px] text-[#94A3B8]">Select an image element on canvas and paste any image URL or select from sample assets below.</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-1 border border-[#27272A] rounded bg-[#18181B]">
              <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300" className="w-full h-20 object-cover rounded" />
              <div className="text-[9px] text-[#A1A1AA] mt-1 truncate">Fluxora Cover</div>
            </div>
            <div className="p-1 border border-[#27272A] rounded bg-[#18181B]">
              <img src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300" className="w-full h-20 object-cover rounded" />
              <div className="text-[9px] text-[#A1A1AA] mt-1 truncate">Cyberpunk Neon</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

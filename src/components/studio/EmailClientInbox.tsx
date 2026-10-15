import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  CheckCircle2,
  Circle,
  Trash2,
  Download,
  Search,
  RefreshCw,
  Eye,
  MessageSquare,
  Archive,
  Flag,
  Pin,
  Clock,
  MoreHorizontal,
  Reply,
  ReplyAll,
  Forward,
  Send,
  Sparkles,
  User,
  Calendar,
  ChevronDown,
  Check,
  AlertCircle,
  Sun,
  Filter,
  CheckSquare,
  Square,
  RotateCcw,
  Inbox,
  X
} from 'lucide-react';
import { useCustomization } from '../../context/CustomizationContext';
import { ContactMessage } from '../../types';

// Avatar color assignment generator based on sender name
function getAvatarColor(name: string = '') {
  const colors = [
    { bg: 'bg-purple-600/80', text: 'text-purple-100' },
    { bg: 'bg-orange-600/80', text: 'text-orange-100' },
    { bg: 'bg-teal-600/80', text: 'text-teal-100' },
    { bg: 'bg-rose-600/80', text: 'text-rose-100' },
    { bg: 'bg-blue-600/80', text: 'text-blue-100' },
    { bg: 'bg-pink-600/80', text: 'text-pink-100' },
    { bg: 'bg-emerald-600/80', text: 'text-emerald-100' },
    { bg: 'bg-amber-600/80', text: 'text-amber-100' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

function getInitials(name: string = '', email: string = '') {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return 'N';
}

// Search text highlight helper
function highlightMatch(text: string, query: string) {
  if (!text) return '';
  if (!query || !query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-[#FF5A1F]/30 text-white font-bold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function EmailClientInbox() {
  const {
    settings,
    contactMessages: ctxMessages,
    markContactMessageRead,
    deleteContactMessage,
    toggleArchiveContactMessage
  } = useCustomization();

  const accentColor = settings?.accentColor || '#FF5A1F';

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'focused' | 'unread' | 'starred' | 'archived' | 'all'>('focused');
  const [search, setSearch] = useState('');
  const [searchScope, setSearchScope] = useState<'all' | 'name' | 'email' | 'content'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const topSearchInputRef = useRef<HTMLInputElement>(null);

  // Email Reply State
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySuccessMsg, setReplySuccessMsg] = useState<string | null>(null);
  const [replyErrorMsg, setReplyErrorMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Shortcut key '/' to quickly focus the search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        topSearchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync real-time Firestore messages
  useEffect(() => {
    if (ctxMessages && ctxMessages.length > 0) {
      const formattedCtx: ContactMessage[] = ctxMessages.map((m: any) => ({
        id: m.id,
        name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Portfolio Visitor',
        firstName: m.firstName || '',
        lastName: m.lastName || '',
        email: m.email || '',
        subject: m.subject || `Inquiry from ${m.name || m.firstName || 'Client'}`,
        message: m.message || '',
        createdAt: m.createdAt || new Date().toISOString(),
        read: m.read || false,
        phone: m.phone || '',
        country: m.country || '',
        replies: m.replies || [],
        isStarred: m.isStarred || false,
        isArchived: m.isArchived || false,
        isPinned: m.isPinned || false,
        category: m.category || 'focused'
      }));

      setMessages((prev) => {
        const map = new Map<string, ContactMessage>();
        for (const m of prev) map.set(m.id, m);
        for (const m of formattedCtx) map.set(m.id, { ...map.get(m.id), ...m });
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      if (!selectedMsgId && formattedCtx.length > 0) {
        setSelectedMsgId(formattedCtx[0].id);
      }
    }
  }, [ctxMessages]);

  const fetchMessagesFromApi = () => {
    setLoading(true);
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.messages) {
          const apiFormatted: ContactMessage[] = data.messages.map((m: any) => ({
            id: m.id,
            name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Portfolio Visitor',
            firstName: m.firstName || '',
            lastName: m.lastName || '',
            email: m.email || '',
            subject: `Portfolio Inquiry from ${m.firstName || 'Client'}`,
            message: m.message || '',
            createdAt: m.timestamp || new Date().toISOString(),
            read: m.read || false,
            phone: m.phone || '',
            country: m.country || '',
            replies: m.replies || [],
            isStarred: false,
            isArchived: false,
            category: 'focused'
          }));

          setMessages((prev) => {
            const map = new Map<string, ContactMessage>();
            for (const m of apiFormatted) map.set(m.id, m);
            for (const m of prev) map.set(m.id, { ...map.get(m.id), ...m });
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      })
      .catch((err) => console.warn('Fetch messages error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessagesFromApi();
  }, []);

  // Filter messages by sender name, email, or content
  const filteredMessages = messages.filter((m) => {
    const q = search.trim().toLowerCase();

    if (q) {
      if (searchScope === 'name') {
        const matchesName = m.name.toLowerCase().includes(q) ||
          (m.firstName && m.firstName.toLowerCase().includes(q)) ||
          (m.lastName && m.lastName.toLowerCase().includes(q));
        if (!matchesName) return false;
      } else if (searchScope === 'email') {
        if (!m.email.toLowerCase().includes(q)) return false;
      } else if (searchScope === 'content') {
        const matchesContent = m.message.toLowerCase().includes(q) ||
          (m.subject && m.subject.toLowerCase().includes(q));
        if (!matchesContent) return false;
      } else {
        // 'all': matches sender name, email, OR content
        const matchesName = m.name.toLowerCase().includes(q) ||
          (m.firstName && m.firstName.toLowerCase().includes(q)) ||
          (m.lastName && m.lastName.toLowerCase().includes(q));
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesContent = m.message.toLowerCase().includes(q) ||
          (m.subject && m.subject.toLowerCase().includes(q));

        if (!matchesName && !matchesEmail && !matchesContent) return false;
      }
    }

    // Archive isolation: keep main inbox clean by hiding archived messages unless in Archive tab
    if (activeTab === 'archived') {
      return m.isArchived === true;
    }

    // All other tabs hide archived messages
    if (m.isArchived) return false;

    if (activeTab === 'unread') return !m.read;
    if (activeTab === 'starred') return m.isStarred;
    return true; // focused / all
  });

  const selectedMsg = messages.find((m) => m.id === selectedMsgId) || filteredMessages[0] || null;

  // Auto-mark selected message as read
  useEffect(() => {
    if (selectedMsg && !selectedMsg.read) {
      if (markContactMessageRead) {
        markContactMessageRead(selectedMsg.id);
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMsg.id ? { ...m, read: true } : m))
      );
    }
  }, [selectedMsgId]);

  // Handle Multi-select
  const toggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMessages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
    }
  };

  // Bulk or single delete
  const handleDelete = async (idToDelete?: string) => {
    const ids = idToDelete ? [idToDelete] : Array.from(selectedIds);
    if (ids.length === 0 && !selectedMsg) return;

    const targetIds = ids.length > 0 ? ids : selectedMsg ? [selectedMsg.id] : [];

    for (const id of targetIds) {
      if (deleteContactMessage) {
        deleteContactMessage(id);
      }
      try {
        await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('Delete warning:', e);
      }
    }

    setMessages((prev) => prev.filter((m) => !targetIds.includes(m.id)));
    setSelectedIds(new Set());
    showToast(`${targetIds.length} message(s) deleted.`);
    if (selectedMsg && targetIds.includes(selectedMsg.id)) {
      const remaining = messages.filter((m) => !targetIds.includes(m.id));
      setSelectedMsgId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Handle Archive / Unarchive
  const handleArchive = async (idToArchive?: string) => {
    const ids = idToArchive ? [idToArchive] : Array.from(selectedIds);
    const targetIds = ids.length > 0 ? ids : selectedMsg ? [selectedMsg.id] : [];
    if (targetIds.length === 0) return;

    const willUnarchive = activeTab === 'archived';

    for (const id of targetIds) {
      if (toggleArchiveContactMessage) {
        toggleArchiveContactMessage(id, !willUnarchive);
      }
    }

    setMessages((prev) =>
      prev.map((m) => (targetIds.includes(m.id) ? { ...m, isArchived: !willUnarchive } : m))
    );

    setSelectedIds(new Set());
    showToast(
      willUnarchive
        ? `${targetIds.length} message(s) restored to Inbox.`
        : `${targetIds.length} message(s) moved to Archive.`
    );
  };

  // Handle Send Reply via Email
  const handleSendEmailReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsg || !replyText.trim()) return;

    setIsSendingReply(true);
    setReplySuccessMsg(null);
    setReplyErrorMsg(null);

    const replySubject = `Re: ${selectedMsg.subject || 'Portfolio Inquiry Response'}`;
    const toEmail = selectedMsg.email;

    try {
      // 1. Send via server endpoint
      const response = await fetch('/api/contact/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: selectedMsg.id,
          toEmail,
          recipientName: selectedMsg.name,
          subject: replySubject,
          replyText: replyText.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      const newReply = {
        id: `rep_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString(),
        text: replyText.trim(),
        sentBy: `${settings?.authorName || 'Nihal Mohammed'} (Admin)`,
      };

      // 2. Update local state & Firestore thread
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === selectedMsg.id) {
            const existingReplies = m.replies || [];
            return {
              ...m,
              replies: [...existingReplies, newReply],
            };
          }
          return m;
        })
      );

      // 3. Launch mailto as backup guarantee
      const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(
        replySubject
      )}&body=${encodeURIComponent(replyText.trim())}`;
      
      setReplySuccessMsg(`Email response sent to ${toEmail}!`);
      setReplyText('');

      setTimeout(() => {
        window.open(mailtoUrl, '_blank');
      }, 600);
    } catch (err: any) {
      console.error('Error sending reply:', err);
      setReplyErrorMsg('Could not send via server. Opening mail client...');
      window.open(
        `mailto:${selectedMsg.email}?subject=Re:%20${encodeURIComponent(
          selectedMsg.subject || 'Portfolio Inquiry'
        )}&body=${encodeURIComponent(replyText.trim())}`,
        '_blank'
      );
    } finally {
      setIsSendingReply(false);
    }
  };

  // Preset Template Insert
  const applyPresetTemplate = (templateType: string) => {
    if (!selectedMsg) return;
    const clientName = selectedMsg.firstName || selectedMsg.name || 'there';
    const adminName = settings?.authorName || 'Nihal Mohammed';
    const adminRole = settings?.authorRole || 'Principal Designer & Developer';

    switch (templateType) {
      case 'accept':
        setReplyText(
          `Hi ${clientName},\n\nThank you for reaching out! I would love to collaborate with you on this project.\n\nI have reviewed your inquiry and am excited to discuss timeline, scope, and deliverables in detail.\n\nLet me know when you are available for a quick discovery call!\n\nBest regards,\n${adminName}\n${adminRole}`
        );
        break;
      case 'calendly':
        setReplyText(
          `Hi ${clientName},\n\nThanks for contacting me regarding your project!\n\nYou can pick a time directly on my calendar for a 15-minute discovery call:\nhttps://calendly.com\n\nLooking forward to speaking with you!\n\nBest regards,\n${adminName}`
        );
        break;
      case 'scope':
        setReplyText(
          `Hi ${clientName},\n\nThank you for your interest! Could you please share a bit more detail regarding your target launch date, design preferences, and full functional scope?\n\nOnce received, I will prepare a detailed proposal and quote for you.\n\nBest,\n${adminName}`
        );
        break;
      default:
        break;
    }
  };

  const archivedCount = messages.filter((m) => m.isArchived).length;
  const unreadCount = messages.filter((m) => !m.isArchived && !m.read).length;
  const activeCount = messages.filter((m) => !m.isArchived).length;

  return (
    <div className="flex flex-col h-full w-full bg-[#090a0d] text-neutral-200 font-sans overflow-hidden select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 bg-[#161822] border border-white/20 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP ACTION TOOLBAR / RIBBON WITH PROMINENT SEARCH BAR */}
      <div className="h-14 border-b border-white/10 bg-[#0f1015] px-4 flex items-center justify-between shrink-0 z-20 gap-3">
        
        {/* Left Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 text-xs font-space shrink-0">
          <button
            onClick={() => handleDelete()}
            disabled={!selectedMsg && selectedIds.size === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 text-neutral-300 disabled:opacity-30 hover:text-red-400 transition-all cursor-pointer"
            title="Delete selected message"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <button
            onClick={() => handleArchive()}
            disabled={!selectedMsg && selectedIds.size === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 text-neutral-300 disabled:opacity-30 transition-all cursor-pointer"
            title={activeTab === 'archived' ? 'Restore to Inbox' : 'Archive message to hide from inbox'}
          >
            {activeTab === 'archived' ? (
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Archive className="w-3.5 h-3.5 text-[#FF5A1F]" />
            )}
            <span className="hidden sm:inline font-semibold">
              {activeTab === 'archived' ? 'Restore to Inbox' : 'Archive'}
            </span>
          </button>

          <button
            onClick={() => {
              if (selectedMsg) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === selectedMsg.id ? { ...m, isStarred: !m.isStarred } : m))
                );
              }
            }}
            disabled={!selectedMsg}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer ${
              selectedMsg?.isStarred ? 'text-amber-400' : 'text-neutral-300'
            }`}
            title="Flag / Star message"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{selectedMsg?.isStarred ? 'Flagged' : 'Flag'}</span>
          </button>

          <button
            onClick={() => fetchMessagesFromApi()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 text-neutral-300 transition-all cursor-pointer"
            title="Refresh inbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>

        {/* PROMINENT TOP SEARCH BAR */}
        <div className="flex-1 max-w-lg relative min-w-0">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-neutral-400 pointer-events-none" />
            <input
              ref={topSearchInputRef}
              type="text"
              placeholder="Search by sender name, email, or content... (Press / to search)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#141622] border border-white/10 hover:border-white/20 focus:border-[#FF5A1F] rounded-xl pl-9 pr-14 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all font-space"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="absolute right-3 text-[10px] font-mono text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 hidden sm:inline-block">
                /
              </span>
            )}
          </div>
        </div>

        {/* Right Status Counters & Export */}
        <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
          <a
            href="/api/messages/csv"
            download
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-white/10 text-neutral-300 transition-all"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-space">CSV</span>
          </a>

          <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-neutral-300 font-bold hidden md:inline">
            {activeCount} Active
          </span>
          {unreadCount > 0 && (
            <span
              className="px-2.5 py-1 rounded-xl text-white font-extrabold shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              {unreadCount} Unread
            </span>
          )}
          {archivedCount > 0 && (
            <span className="px-2 py-1 rounded-xl bg-neutral-800/80 border border-neutral-700 text-neutral-400 font-bold hidden sm:inline">
              📦 {archivedCount}
            </span>
          )}
        </div>
      </div>

      {/* 2. MAIN 2-PANE CONTENT */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* LEFT LIST COLUMN (~360px-380px wide) */}
        <div className="w-full sm:w-[360px] md:w-[380px] border-r border-white/10 bg-[#0c0d12] flex flex-col shrink-0 min-h-0">
          
          {/* Inbox Filter Tabs */}
          <div className="px-3 pt-3 pb-2 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-space font-semibold overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('focused')}
                className={`pb-1 relative cursor-pointer whitespace-nowrap ${
                  activeTab === 'focused' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Inbox
                {activeTab === 'focused' && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('unread')}
                className={`pb-1 relative cursor-pointer whitespace-nowrap ${
                  activeTab === 'unread' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Unread ({unreadCount})
                {activeTab === 'unread' && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('starred')}
                className={`pb-1 relative cursor-pointer whitespace-nowrap ${
                  activeTab === 'starred' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Starred
                {activeTab === 'starred' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 rounded-full" />
                )}
              </button>

              {/* ARCHIVED TAB */}
              <button
                onClick={() => setActiveTab('archived')}
                className={`pb-1 relative cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'archived' ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Archive className="w-3 h-3 text-neutral-400" />
                <span>Archive ({archivedCount})</span>
                {activeTab === 'archived' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-full" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-1 text-neutral-400 shrink-0">
              <button
                onClick={toggleSelectAll}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Select all"
              >
                {selectedIds.size > 0 && selectedIds.size === filteredMessages.length ? (
                  <CheckSquare className="w-3.5 h-3.5 text-[#FF5A1F]" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar Input & Scope Filter in List Pane */}
          <div className="p-2 border-b border-white/10 space-y-1.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Filter sender, email, or content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#12141a] border border-white/10 rounded-xl pl-9 pr-7 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5A1F] transition-all font-space"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Search Scope Chips */}
            <div className="flex items-center gap-1 text-[10px] font-space text-neutral-400 overflow-x-auto no-scrollbar">
              <span className="text-neutral-500 shrink-0">Filter in:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'name', label: 'Sender' },
                { id: 'email', label: 'Email' },
                { id: 'content', label: 'Content' }
              ].map((scope) => (
                <button
                  key={scope.id}
                  onClick={() => setSearchScope(scope.id as any)}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer shrink-0 ${
                    searchScope === scope.id
                      ? 'bg-white/15 text-white font-bold'
                      : 'hover:bg-white/5 text-neutral-400'
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>

            {/* Active Search Result Summary Pill */}
            {search.trim() && (
              <div className="flex items-center justify-between text-[11px] font-space px-2 py-1 rounded-lg bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-white">
                <span className="truncate">
                  Found <strong>{filteredMessages.length}</strong> match{filteredMessages.length === 1 ? '' : 'es'}
                </span>
                <button
                  onClick={() => setSearch('')}
                  className="text-neutral-400 hover:text-white underline cursor-pointer shrink-0 ml-2"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Message List Stream */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 min-h-0">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 space-y-2">
                <Inbox className="w-8 h-8 mx-auto opacity-30 text-neutral-400" />
                <p className="text-xs font-semibold text-neutral-300 font-syne">
                  {search ? `No messages match "${search}"` : activeTab === 'archived' ? 'No archived messages' : 'Inbox is clean & empty'}
                </p>
                <p className="text-[11px] font-space text-neutral-500">
                  {search ? (
                    <button
                      onClick={() => setSearch('')}
                      className="text-[#FF5A1F] hover:underline cursor-pointer"
                    >
                      Clear search filter to see all messages
                    </button>
                  ) : activeTab === 'archived' ? (
                    'Completed messages you archive will stay stored here.'
                  ) : (
                    'Incoming client portfolio inquiries will land here in real-time.'
                  )}
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMsg?.id === msg.id;
                const isChecked = selectedIds.has(msg.id);
                const avatarStyle = getAvatarColor(msg.name);
                const initials = getInitials(msg.name, msg.email);

                const dateStr = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recent';

                const timeStr = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMsgId(msg.id)}
                    className={`p-3 cursor-pointer transition-all flex items-start gap-3 relative group ${
                      isSelected
                        ? 'bg-white/10 border-l-4'
                        : !msg.read
                        ? 'bg-[#141620] hover:bg-white/5'
                        : 'bg-[#0f1015] hover:bg-white/5 opacity-85'
                    }`}
                    style={isSelected ? { borderLeftColor: accentColor } : {}}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={(e) => toggleSelectId(msg.id, e)}
                      className="mt-1 text-neutral-500 hover:text-white cursor-pointer shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>

                    {/* Sender Circle Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full ${avatarStyle.bg} ${avatarStyle.text} flex items-center justify-center font-bold text-xs shrink-0 shadow-md font-space`}
                    >
                      {initials}
                    </div>

                    {/* Main List Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs truncate font-syne ${
                            !msg.read ? 'font-extrabold text-white' : 'font-medium text-neutral-300'
                          }`}
                        >
                          {highlightMatch(msg.name, search)}
                        </h4>
                        <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                          {dateStr} {timeStr}
                        </span>
                      </div>

                      {/* Subject Line */}
                      <p
                        className="text-xs font-semibold font-space truncate mt-0.5"
                        style={{ color: accentColor }}
                      >
                        {highlightMatch(msg.subject || `Inquiry from ${msg.name}`, search)}
                      </p>

                      {/* Snippet Preview with Highlights */}
                      <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5 font-sans leading-tight">
                        {highlightMatch(msg.message, search)}
                      </p>

                      {/* Sender Email under preview if email matches query */}
                      {search && msg.email.toLowerCase().includes(search.toLowerCase()) && (
                        <p className="text-[10px] font-mono text-neutral-400 truncate mt-0.5">
                          Email: {highlightMatch(msg.email, search)}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {msg.replies && msg.replies.length > 0 && (
                          <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md">
                            ✓ Replied ({msg.replies.length})
                          </span>
                        )}
                        {msg.isArchived && (
                          <span className="text-[9px] font-mono font-bold bg-neutral-800 text-neutral-400 border border-neutral-700 px-1.5 py-0.2 rounded-md">
                            📦 Archived
                          </span>
                        )}
                        {!msg.read && (
                          <span
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: accentColor }}
                          />
                        )}
                        {msg.isStarred && (
                          <Flag className="w-3 h-3 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT MAIN READING PANE (FULL MESSAGE & REPLY ENGINE) */}
        <div className="hidden sm:flex flex-1 flex-col bg-[#090a0d] overflow-y-auto min-h-0">
          {selectedMsg ? (
            <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
              
              {/* READING PANE HEADER BAR */}
              <div className="flex items-start justify-between border-b border-white/10 pb-5 gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-syne">
                    {highlightMatch(selectedMsg.subject || `Inquiry from ${selectedMsg.name}`, search)}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="text-xs font-mono font-bold px-3 py-0.5 rounded-full border border-white/20"
                      style={{ color: accentColor, backgroundColor: `${accentColor}15` }}
                    >
                      Portfolio Direct Inquiry
                    </span>
                    {selectedMsg.country && (
                      <span className="text-xs font-mono text-neutral-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                        📍 {selectedMsg.country}
                      </span>
                    )}
                    {selectedMsg.isArchived && (
                      <span className="text-xs font-mono text-neutral-300 bg-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-700">
                        📦 Archived Message
                      </span>
                    )}
                  </div>
                </div>

                {/* Header Action Icons */}
                <div className="flex items-center gap-1 text-neutral-400">
                  <button
                    onClick={() => handleArchive(selectedMsg.id)}
                    className="p-2 hover:bg-white/10 hover:text-white rounded-xl transition-all cursor-pointer"
                    title={selectedMsg.isArchived ? 'Restore to main inbox' : 'Archive message'}
                  >
                    {selectedMsg.isArchived ? (
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Archive className="w-4 h-4 text-[#FF5A1F]" />
                    )}
                  </button>
                  <a
                    href="#reply-composer"
                    className="p-2 hover:bg-white/10 hover:text-white rounded-xl transition-all cursor-pointer"
                    title="Reply via email"
                  >
                    <Reply className="w-4 h-4 text-white" />
                  </a>
                  <button
                    onClick={() => applyPresetTemplate('accept')}
                    className="p-2 hover:bg-white/10 hover:text-white rounded-xl transition-all cursor-pointer"
                    title="Quick template"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMsg.id)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SENDER INFO CARD */}
              <div className="flex items-start justify-between gap-4 bg-[#101117] border border-white/10 p-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${
                      getAvatarColor(selectedMsg.name).bg
                    } text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg font-space`}
                  >
                    {getInitials(selectedMsg.name, selectedMsg.email)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white font-syne">
                        {highlightMatch(selectedMsg.name, search)}
                      </h3>
                      <span className="text-xs font-mono text-neutral-400">
                        &lt;{highlightMatch(selectedMsg.email, search)}&gt;
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      To: You &lt;{settings?.authorEmail || 'nihal.graphix@gmail.com'}&gt;
                    </p>
                    {selectedMsg.phone && (
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Phone: {selectedMsg.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-neutral-500">
                  <p>{selectedMsg.createdAt ? new Date(selectedMsg.createdAt).toLocaleString() : 'Recently'}</p>
                </div>
              </div>

              {/* MESSAGE CONTENT BODY CARD */}
              <div className="bg-[#101117] border border-white/10 p-6 rounded-2xl space-y-4">
                <div className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {highlightMatch(selectedMsg.message, search)}
                </div>
              </div>

              {/* SENT REPLIES HISTORY THREAD */}
              {selectedMsg.replies && selectedMsg.replies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4
                    className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2"
                    style={{ color: accentColor }}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SENT EMAIL RESPONSES ({selectedMsg.replies.length})</span>
                  </h4>

                  <div className="space-y-3">
                    {selectedMsg.replies.map((rep) => (
                      <div
                        key={rep.id}
                        className="bg-[#13151f] border border-white/10 p-4 rounded-2xl space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                          <span className="font-bold text-white font-syne flex items-center gap-1.5">
                            <Send className="w-3 h-3 text-[#FF5A1F]" />
                            {rep.sentBy || `${settings?.authorName || 'Nihal Mohammed'} (Admin)`}
                          </span>
                          <span className="font-mono text-neutral-500 text-[10px]">{rep.timestamp}</span>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap font-sans">
                          {rep.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. INTERACTIVE EMAIL REPLY COMPOSER */}
              <div id="reply-composer" className="bg-[#101117] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Reply className="w-4 h-4 text-[#FF5A1F]" />
                    <h3 className="text-sm font-bold text-white font-syne">Reply via Email</h3>
                  </div>

                  <span className="text-xs font-mono text-neutral-400">
                    To: <strong className="text-white">{selectedMsg.email}</strong>
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-[11px] font-mono text-neutral-500 self-center mr-1">Quick Templates:</span>
                  <button
                    type="button"
                    onClick={() => applyPresetTemplate('accept')}
                    className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 font-medium transition-colors cursor-pointer"
                  >
                    ✨ Accept Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTemplate('calendly')}
                    className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 font-medium transition-colors cursor-pointer"
                  >
                    📅 Send Discovery Call Link
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTemplate('scope')}
                    className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 font-medium transition-colors cursor-pointer"
                  >
                    📊 Request Scope Details
                  </button>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendEmailReply} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                      Subject: Re: {selectedMsg.subject || `Inquiry from ${selectedMsg.name}`}
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Type your response to ${selectedMsg.name}...`}
                      className="w-full bg-[#151720] border border-white/10 rounded-xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5A1F] leading-relaxed transition-all resize-none font-sans"
                    />
                  </div>

                  {replySuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{replySuccessMsg}</span>
                    </div>
                  )}

                  {replyErrorMsg && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{replyErrorMsg}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <a
                      href={`mailto:${selectedMsg.email}?subject=Re:%20${encodeURIComponent(
                        selectedMsg.subject || 'Portfolio Inquiry'
                      )}&body=${encodeURIComponent(replyText)}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-medium transition-all border border-white/10"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span>Open in Native Mail Client (`mailto:`)</span>
                    </a>

                    <button
                      type="submit"
                      disabled={isSendingReply || !replyText.trim()}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-lg hover:brightness-110 disabled:opacity-50 cursor-pointer font-syne"
                      style={{ backgroundColor: accentColor }}
                    >
                      {isSendingReply ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching Reply...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Email Reply Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500 space-y-3">
              <Mail className="w-12 h-12 opacity-30 text-neutral-400" />
              <h3 className="text-sm font-bold text-white font-syne">
                {search ? 'No message selected' : 'Select a message from the list'}
              </h3>
              <p className="text-xs max-w-sm font-space">
                {search
                  ? `Filtering results for "${search}". Choose an inquiry on the left to read and respond.`
                  : 'Choose an inquiry from the left pane to view full sender details, location, message thread, and reply directly via email.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

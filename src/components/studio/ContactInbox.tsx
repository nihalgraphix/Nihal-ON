import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Circle, Trash2, Download, Search, RefreshCw, Eye, MessageSquare } from 'lucide-react';

interface ContactMessage {
  id: string;
  timestamp: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  message: string;
  read?: boolean;
}

export default function ContactInbox() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMessages = () => {
    setLoading(true);
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.messages) {
          setMessages(data.messages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleRead = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: !m.read } : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMsg = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(msgs => msgs.filter(m => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = messages.filter(m =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#111214] flex overflow-hidden min-h-0">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 min-h-0">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2E34] pb-5">
            <div>
              <h1 className="text-xl font-bold text-[#F4F4F5] tracking-tight">
                Contact Messages & Inquiries
              </h1>
              <p className="text-xs text-[#71717A] mt-1">
                {messages.length} Total Submissions &bull; {messages.filter(m => !m.read).length} Unread
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/api/messages/csv"
                download
                className="flex items-center gap-1.5 bg-[#17181B] hover:bg-[#202126] text-[#F4F4F5] border border-[#2C2E34] px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
              <button
                onClick={fetchMessages}
                className="p-2 bg-[#17181B] hover:bg-[#202126] text-[#A1A1AA] hover:text-white border border-[#2C2E34] rounded-md text-xs transition-colors cursor-pointer"
                title="Refresh messages"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search sender, email, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#17181B] border border-[#2C2E34] rounded-md pl-9 pr-4 py-2 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 border border-[#2C2E34] rounded-xl bg-[#17181B] text-center text-[#71717A]">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#A1A1AA]" />
              <p className="text-xs font-medium text-[#F4F4F5]">No messages found</p>
              <p className="text-[11px] mt-1">Contact inquiries submitted from your public portfolio will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(msg => {
                const isSelected = selectedMessage?.id === msg.id;
                const isRead = !!msg.read;
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-[#FF5A1F] bg-[#1C1E23]'
                        : isRead
                        ? 'border-[#2C2E34] bg-[#17181B] opacity-80 hover:opacity-100 hover:border-[#3E4048]'
                        : 'border-[#3E4048] bg-[#1A1C20] hover:border-[#FF5A1F]/50'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRead(msg.id);
                        }}
                        className="mt-0.5 sm:mt-0 text-[#71717A] hover:text-[#FF5A1F] transition-colors"
                        title={isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        {isRead ? <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> : <Circle className="w-4 h-4 text-[#FF5A1F]" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs ${isRead ? 'font-medium text-[#A1A1AA]' : 'font-bold text-white'}`}>
                            {msg.firstName} {msg.lastName}
                          </h4>
                          <span className="text-[10px] text-[#71717A] font-mono">
                            {msg.email}
                          </span>
                        </div>
                        <p className="text-xs text-[#71717A] line-clamp-1 mt-0.5">
                          {msg.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#71717A] font-mono self-end sm:self-center shrink-0">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMsg(msg.id);
                        }}
                        className="p-1 hover:text-[#EF4444] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Message Detail Drawer */}
      {selectedMessage && (
        <aside className="w-96 bg-[#17181B] border-l border-[#2C2E34] flex flex-col p-5 select-none h-full shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-[#2C2E34]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
              MESSAGE DETAILS
            </h3>
            <button
              onClick={() => setSelectedMessage(null)}
              className="text-[#71717A] hover:text-white text-xs"
            >
              Close
            </button>
          </div>

          <div className="py-4 space-y-4 text-xs">
            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-mono block">Sender</span>
              <p className="text-sm font-bold text-white mt-0.5">
                {selectedMessage.firstName} {selectedMessage.lastName}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-mono block">Email</span>
              <a href={`mailto:${selectedMessage.email}`} className="text-xs text-[#FF5A1F] hover:underline font-mono">
                {selectedMessage.email}
              </a>
            </div>

            {selectedMessage.phone && (
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-mono block">Phone</span>
                <p className="text-xs text-[#F4F4F5] font-mono">{selectedMessage.phone}</p>
              </div>
            )}

            {selectedMessage.country && (
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-mono block">Location</span>
                <p className="text-xs text-[#F4F4F5]">{selectedMessage.country}</p>
              </div>
            )}

            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-mono block">Sent Date</span>
              <p className="text-xs text-[#A1A1AA] font-mono">{selectedMessage.timestamp}</p>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-[#71717A] uppercase font-mono block mb-1">Message Body</span>
              <div className="p-3 rounded-lg bg-[#111214] border border-[#2C2E34] text-xs text-[#E4E4E7] leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            <div className="pt-4 flex items-center gap-2">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re:%20Portfolio%20Inquiry`}
                className="flex-1 bg-[#FF5A1F] hover:bg-[#FF723F] text-white py-2 rounded-md font-semibold text-center transition-colors"
              >
                Reply via Email
              </a>
              <button
                onClick={() => deleteMsg(selectedMessage.id)}
                className="p-2 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-md transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

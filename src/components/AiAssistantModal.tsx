import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bot, Send, Sparkles, User, Loader2 } from 'lucide-react';
import Logo from './Logo';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAssistantModal({
  isOpen,
  onClose
}: AiAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm NIHAL AI, Nihal . ON's interactive portfolio guide. Ask me anything about Nihal's case studies, design philosophy, tech stack (React 19, Next.js, Framer Motion), or project availability!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: newHistory })
      });

      const data = await res.json();
      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Nihal . ON is available for Q3/Q4 custom projects! You can book a 15-minute call directly or submit a project proposal in the Contact section." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Nihal . ON is a Senior Creative Technologist specializing in React 19, Framer Motion, and Awwwards-winning dark luxury web applications. Feel free to book a discovery call!" }]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "What is Nihal's design philosophy?",
    "Show me Nihal's top case studies",
    "What is the typical project timeline?",
    "How does Nihal approach AI integrations?"
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-2xl"
      >
        <div className="relative w-full max-w-2xl rounded-3xl bg-[#090909] border border-[#FF5A1F]/40 shadow-2xl overflow-hidden flex flex-col h-[620px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#111111] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black border border-white/20 p-1.5 shadow-lg shadow-[#FF5A1F]/30">
                <Logo className="h-full w-full" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-white text-base">NIHAL AI Concierge</h3>
                <span className="text-[10px] font-space text-[#FF5A1F] font-semibold">Powered by Gemini 2.5 Flash</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#FF5A1F] hover:text-black transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/40 mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm font-sans leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#FF5A1F] text-black font-medium shadow-md'
                      : 'bg-[#111111] text-neutral-200 border border-white/10'
                  }`}
                >
                  {m.content}
                </div>

                {m.role === 'user' && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-xs font-space text-[#FF5A1F]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>NIHAL AI is synthesizing response...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts */}
          <div className="px-6 py-2 flex flex-wrap gap-1.5 border-t border-white/5 bg-[#0d0d0d]">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => setInput(p)}
                className="text-[10px] font-space text-neutral-400 bg-white/5 hover:bg-[#FF5A1F]/20 hover:text-[#FF5A1F] px-2.5 py-1 rounded-full transition-colors"
              >
                "{p}"
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-[#111111] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask AI about Nihal's projects, pricing, or tech stack..."
              className="flex-1 rounded-xl bg-[#090909] border border-white/10 px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-[#FF5A1F] focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center justify-center rounded-xl bg-[#FF5A1F] px-5 py-3 text-black font-bold hover:bg-orange-500 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

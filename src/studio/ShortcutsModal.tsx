import React from 'react';
import { useStudio } from './StudioContext';
import { X, Command } from 'lucide-react';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useStudio();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Z / Cmd + Z', desc: 'Undo last change' },
    { key: 'Ctrl + Y / Cmd + Y', desc: 'Redo change' },
    { key: 'Ctrl + S / Cmd + S', desc: 'Save Draft' },
    { key: 'Escape', desc: 'Deselect selected element' },
    { key: 'Double Click', desc: 'Inline text editor on canvas' },
    { key: '?', desc: 'Toggle Shortcuts Modal' },
  ];

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-xs select-none">
      <div className="bg-[#111115] border border-[#27272A] rounded-xl max-w-md w-full p-5 text-white shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272A] mb-4">
          <div className="flex items-center gap-2 font-syne font-bold text-sm text-[#FF5A1F]">
            <Command className="h-4 w-4" /> Keyboard Shortcuts
          </div>
          <button onClick={() => setIsShortcutsOpen(false)} className="text-[#A1A1AA] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex justify-between items-center py-1.5 border-b border-[#1E1E24]">
              <span className="text-[#A1A1AA]">{s.desc}</span>
              <kbd className="bg-[#18181B] border border-[#27272A] px-2 py-0.5 rounded text-[10px] font-mono text-[#FF5A1F]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

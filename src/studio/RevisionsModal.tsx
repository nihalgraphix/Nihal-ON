import React, { useEffect, useState } from 'react';
import { useStudio } from './StudioContext';
import { X, History, RotateCcw } from 'lucide-react';
import { RevisionCheckpoint } from './types';

export const RevisionsModal: React.FC = () => {
  const { isRevisionsOpen, setIsRevisionsOpen, restoreCheckpoint } = useStudio();
  const [revisions, setRevisions] = useState<RevisionCheckpoint[]>([]);

  useEffect(() => {
    if (isRevisionsOpen) {
      fetch('/api/website-config/revisions')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setRevisions(data.revisions || []);
        })
        .catch(() => {});
    }
  }, [isRevisionsOpen]);

  if (!isRevisionsOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-xs select-none">
      <div className="bg-[#111115] border border-[#27272A] rounded-xl max-w-lg w-full p-5 text-white shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272A] mb-4">
          <div className="flex items-center gap-2 font-syne font-bold text-sm text-[#FF5A1F]">
            <History className="h-4 w-4" /> Revision Checkpoints History
          </div>
          <button onClick={() => setIsRevisionsOpen(false)} className="text-[#A1A1AA] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {revisions.length === 0 ? (
            <div className="text-[#71717A] italic text-center py-6">No previous revision checkpoints recorded yet.</div>
          ) : (
            revisions.map((rev) => (
              <div key={rev.id} className="p-3 bg-[#18181B] border border-[#27272A] rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{rev.name}</div>
                  <div className="text-[10px] text-[#A1A1AA] font-mono">{new Date(rev.timestamp).toLocaleString()}</div>
                </div>
                <button
                  onClick={() => {
                    restoreCheckpoint(rev.config as any);
                    setIsRevisionsOpen(false);
                  }}
                  className="flex items-center gap-1 bg-[#FF5A1F] text-black font-bold px-2.5 py-1 rounded hover:bg-white transition-all text-xs"
                >
                  <RotateCcw className="h-3 w-3" /> Restore
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

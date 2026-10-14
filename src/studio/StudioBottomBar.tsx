import React from 'react';
import { useStudio } from './StudioContext';
import { ChevronRight, Box, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const StudioBottomBar: React.FC = () => {
  const {
    mode,
    elements,
    selectedElementId,
    setSelectedElementId,
    saveStatus,
    lastSavedTime
  } = useStudio();

  if (mode !== 'edit') return null;

  // Build breadcrumbs array from selected element up to root
  const breadcrumbs: Array<{ id: string; name: string; type: string }> = [];
  let currId = selectedElementId;
  while (currId && elements[currId]) {
    const el = elements[currId];
    breadcrumbs.unshift({ id: el.id, name: el.name, type: el.type });
    currId = el.parentId;
  }

  return (
    <div className="sticky bottom-0 z-[1000] h-8 bg-[#09090B] border-t border-[#27272A] px-4 flex items-center justify-between text-white font-sans text-[11px] select-none shadow-xl">
      {/* Breadcrumbs Path */}
      <div className="flex items-center gap-1 overflow-x-auto">
        <span className="text-[#A1A1AA] font-bold">Page</span>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id}>
            <ChevronRight className="h-3 w-3 text-[#52525B]" />
            <button
              onClick={() => setSelectedElementId(crumb.id)}
              className={`flex items-center gap-1 hover:text-[#FF5A1F] transition-colors ${
                idx === breadcrumbs.length - 1 ? 'font-bold text-[#FF5A1F]' : 'text-[#A1A1AA]'
              }`}
            >
              <Box className="h-3 w-3" />
              <span>{crumb.name}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Save Status & Time Indicator */}
      <div className="flex items-center gap-2">
        {saveStatus === 'saving' && (
          <span className="flex items-center gap-1 text-amber-400">
            <RefreshCw className="h-3 w-3 animate-spin" /> Saving draft...
          </span>
        )}
        {saveStatus === 'publishing' && (
          <span className="flex items-center gap-1 text-[#FF5A1F]">
            <RefreshCw className="h-3 w-3 animate-spin" /> Publishing live...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="flex items-center gap-1 text-emerald-400 font-mono">
            <CheckCircle2 className="h-3 w-3" /> Saved {lastSavedTime ? `at ${lastSavedTime}` : ''}
          </span>
        )}
        {saveStatus === 'published' && (
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 className="h-3 w-3" /> Live & Published
          </span>
        )}
      </div>
    </div>
  );
};

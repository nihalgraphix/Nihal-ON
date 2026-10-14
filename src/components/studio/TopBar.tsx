import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { BookOpen, Undo2, Redo2, Check, ExternalLink, X, Laptop, Tablet, Smartphone, RotateCcw } from 'lucide-react';

export default function TopBar() {
  const {
    saveStatus,
    publish,
    resetToDefault,
    undo,
    redo,
    canUndo,
    canRedo,
    activeTab,
    previewDevice,
    setPreviewDevice,
    closeStudio,
    interactMode,
    setInteractMode,
  } = useStudio();

  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    await resetToDefault();
    setConfirmReset(false);
  };

  return (
    <header className="h-14 border-b border-[#2C2E34] bg-[#17181B] px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand & Studio Title matching screenshot */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-[#F4F4F5] font-semibold text-sm tracking-tight">
          <div className="w-6 h-6 rounded flex items-center justify-center bg-[#25272D] text-[#FF5A1F] border border-[#2C2E34]">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span>Portfolio Studio</span>
        </div>

        {/* Viewport switchers when in Visual Editor */}
        {activeTab === 'editor' && (
          <div className="hidden sm:flex items-center gap-1 ml-4 bg-[#111214] p-1 rounded-md border border-[#2C2E34]">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded text-xs transition-colors ${previewDevice === 'desktop' ? 'bg-[#25272D] text-white shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}
              title="Desktop View (1200px)"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-1.5 rounded text-xs transition-colors ${previewDevice === 'tablet' ? 'bg-[#25272D] text-white shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded text-xs transition-colors ${previewDevice === 'mobile' ? 'bg-[#25272D] text-white shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Right: Actions matching screenshot */}
      <div className="flex items-center gap-3">
        {/* Undo & Redo */}
        <div className="flex items-center gap-1 mr-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${canUndo ? 'text-[#A1A1AA] hover:text-white hover:bg-[#202126]' : 'text-[#44464E] cursor-not-allowed'}`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${canRedo ? 'text-[#A1A1AA] hover:text-white hover:bg-[#202126]' : 'text-[#44464E] cursor-not-allowed'}`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Save Status Text matching screenshot */}
        <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA] font-mono pr-2">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-[#FF8A00]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A00] animate-ping" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-[#71717A]">
              <Check className="w-3.5 h-3.5 text-[#22C55E]" />
              Saved
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="text-[#EAB308]">Draft</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-[#EF4444]">Error saving</span>
          )}
        </div>

        {/* Reset to Default Button */}
        <button
          onClick={handleReset}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            confirmReset
              ? 'bg-[#EF4444] text-white font-bold animate-pulse'
              : 'bg-[#202126] text-[#A1A1AA] hover:text-white border border-[#2C2E34]'
          }`}
          title="Reset all content, texts, photos, and layout back to factory defaults"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${confirmReset ? 'animate-spin' : ''}`} />
          <span>{confirmReset ? 'Click to Confirm Reset' : 'Reset Default'}</span>
        </button>

        {/* Publish Button matching exact white styling from screenshot */}
        <button
          onClick={publish}
          className="bg-white text-black hover:bg-[#E4E4E7] active:bg-[#D4D4D8] transition-all font-semibold text-xs px-4 py-1.5 rounded-md shadow-xs cursor-pointer tracking-tight"
        >
          Publish
        </button>

        {/* Exit / Return to Live Website */}
        <button
          onClick={closeStudio}
          className="text-[#71717A] hover:text-white hover:bg-[#202126] p-1.5 rounded transition-colors ml-1 cursor-pointer"
          title="Return to Public Website"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

import React from 'react';
import { useStudio } from './StudioContext';
import { StudioTopBar } from './StudioTopBar';
import { StudioLeftSidebar } from './StudioLeftSidebar';
import { StudioRightInspector } from './StudioRightInspector';
import { StudioBottomBar } from './StudioBottomBar';
import { ShortcutsModal } from './ShortcutsModal';
import { RevisionsModal } from './RevisionsModal';

export const StudioLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode, viewport, zoom } = useStudio();

  if (mode !== 'edit') {
    return <>{children}</>;
  }

  // Max width mapping based on active device breakpoint
  const getViewportWidthClass = () => {
    switch (viewport) {
      case 'laptop':
        return 'max-w-[1024px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'mobile':
        return 'max-w-[375px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#09090B] text-white flex flex-col font-sans overflow-hidden select-none">
      {/* Studio Top Control Toolbar */}
      <StudioTopBar />

      {/* Studio Main Workspace (Left Sidebar | Live Canvas | Right Inspector) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left DOM Hierarchy Tree & Palette Sidebar */}
        <StudioLeftSidebar />

        {/* Center Live Website Canvas Frame */}
        <main className="flex-1 bg-[#050507] overflow-y-auto relative flex flex-col items-center p-4 sm:p-6 bg-grid-pattern">
          {/* Viewport Frame Container */}
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className={`transition-all duration-300 ${getViewportWidthClass()} bg-[#060606] shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-[#27272A] rounded-xl overflow-x-hidden min-h-screen relative`}
          >
            {/* Live Portfolio Components */}
            {children}
          </div>
        </main>

        {/* Right Properties Inspector Sidebar */}
        <StudioRightInspector />
      </div>

      {/* Studio Bottom Breadcrumbs & Status Bar */}
      <StudioBottomBar />

      {/* Interactive Helper Dialog Modals */}
      <ShortcutsModal />
      <RevisionsModal />
    </div>
  );
};

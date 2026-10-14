import React, { useState, useRef } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Shield, Move } from 'lucide-react';
import AdminLoginModal from './AdminLoginModal';

export default function AdminFloatingButton() {
  const { isAdmin, isStudioOpen, openStudio, draftData } = useStudio();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Position state for custom dragging
  const [customPos, setCustomPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  if (isStudioOpen) return null;
  if (draftData.siteSettings?.showAdminButton === false) return null;

  const label = draftData.siteSettings?.adminButtonLabel || 'Admin';

  const handleClick = () => {
    if (isDragging) return;
    if (isAdmin) {
      openStudio();
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if holding left click and target isn't clicked too quickly
    const initX = customPos ? customPos.x : (window.innerWidth - 120);
    const initY = customPos ? customPos.y : (window.innerHeight - 60);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX,
      initY,
    };

    let moved = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaY = moveEvent.clientY - dragStartRef.current.startY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        moved = true;
        setIsDragging(true);
        const nextX = Math.max(10, Math.min(window.innerWidth - 100, dragStartRef.current.initX + deltaX));
        const nextY = Math.max(10, Math.min(window.innerHeight - 50, dragStartRef.current.initY + deltaY));
        setCustomPos({ x: nextX, y: nextY });
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setTimeout(() => setIsDragging(false), 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const stylePosition = customPos
    ? { position: 'fixed' as const, left: `${customPos.x}px`, top: `${customPos.y}px`, bottom: 'auto', right: 'auto' }
    : undefined;

  const positionClass = customPos
    ? ''
    : draftData.siteSettings?.adminButtonPosition === 'bottom-right'
    ? 'right-5 bottom-5'
    : 'left-5 bottom-5';

  return (
    <>
      <div
        style={stylePosition}
        onMouseDown={handleMouseDown}
        className={`fixed ${positionClass} z-[9999] safe-area-inset-bottom select-none`}
      >
        <button
          onClick={handleClick}
          title="Click to open Admin Studio, or drag with mouse to move"
          className="group flex items-center gap-2 bg-[#17181B]/95 hover:bg-[#202126] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#2C2E34] hover:border-[#FF5A1F]/60 px-3 py-2 rounded-lg shadow-xl shadow-black/40 backdrop-blur-md transition-colors cursor-pointer text-xs font-mono"
        >
          <div className="w-4 h-4 flex items-center justify-center text-[#FF5A1F]">
            <Shield className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-medium tracking-tight pr-0.5">{label}</span>
          <Move className="w-3 h-3 text-[#71717A] opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]/80 group-hover:bg-[#FF5A1F] transition-colors" />
        </button>
      </div>

      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => openStudio()}
      />
    </>
  );
}

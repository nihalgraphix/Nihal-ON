import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Move, Minus, Plus, Maximize2, Minimize2, Dock, X } from 'lucide-react';

interface DraggablePanelProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isFloating: boolean;
  onToggleFloating?: () => void;
  defaultPos?: { x: number; y: number };
  defaultWidth?: number;
  defaultHeight?: number;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export default function DraggablePanel({
  id,
  title,
  icon,
  isFloating,
  onToggleFloating,
  defaultPos = { x: 20, y: 80 },
  defaultWidth = 300,
  defaultHeight,
  children,
  className = '',
  headerActions,
}: DraggablePanelProps) {
  const [pos, setPos] = useState<{ x: number; y: number }>(defaultPos);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [zIndex, setZIndex] = useState(50);

  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: defaultPos.x,
    initY: defaultPos.y,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFloating) return;
    // Don't drag if clicking buttons
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;

    setIsDragging(true);
    setZIndex(90);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: pos.x,
      initY: pos.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaY = moveEvent.clientY - dragStartRef.current.startY;

      const nextX = Math.max(10, Math.min(window.innerWidth - 100, dragStartRef.current.initX + deltaX));
      const nextY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.initY + deltaY));

      setPos({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (!isFloating) {
    // Docked standard layout
    return <div className={`h-full flex flex-col ${className}`}>{children}</div>;
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${defaultWidth}px`,
        maxHeight: isMinimized ? '44px' : 'calc(100vh - 120px)',
        zIndex,
      }}
      onClick={() => setZIndex(90)}
      className={`bg-[#17181B]/95 backdrop-blur-md border ${
        isDragging ? 'border-[#FF5A1F] shadow-[#FF5A1F]/20' : 'border-[#2C2E34]'
      } rounded-xl shadow-2xl flex flex-col overflow-hidden transition-shadow duration-150 select-none ${className}`}
    >
      {/* Header Handle Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="h-10 px-3 bg-[#1D1E22]/90 border-b border-[#2C2E34] flex items-center justify-between cursor-grab active:cursor-grabbing shrink-0"
      >
        <div className="flex items-center gap-2 truncate">
          <GripVertical className="w-4 h-4 text-[#FF5A1F] shrink-0" />
          {icon && <span className="text-[#A1A1AA]">{icon}</span>}
          <span className="text-xs font-bold font-mono text-[#F4F4F5] truncate tracking-tight">{title}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {headerActions}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-[#2A2C32] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            title={isMinimized ? 'Expand panel' : 'Minimize panel'}
          >
            {isMinimized ? <Plus className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>

          {onToggleFloating && (
            <button
              onClick={onToggleFloating}
              className="p-1 rounded hover:bg-[#2A2C32] text-[#A1A1AA] hover:text-[#FF5A1F] transition-colors cursor-pointer"
              title="Dock Panel back into layout"
            >
              <Dock className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Panel Body */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto min-h-0 bg-[#17181B]/80 text-[#E0E0E0]">
          {children}
        </div>
      )}
    </div>
  );
}

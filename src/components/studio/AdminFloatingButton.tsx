import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Shield, Move, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminLoginModal from './AdminLoginModal';

export default function AdminFloatingButton() {
  const {
    isAdmin,
    isStudioOpen,
    openStudio,
    draftData,
    isAdminButtonVisible,
    toggleAdminButton,
  } = useStudio();

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Position state for custom dragging
  const [customPos, setCustomPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  // Watch visibility changes to display clean toast feedback
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setToastMessage(
      isAdminButtonVisible
        ? 'Admin button visible (Win + Shift + A to toggle)'
        : 'Admin button hidden (Win + Shift + A to toggle)'
    );
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [isAdminButtonVisible]);

  // Listen for inspection attempts being denied
  useEffect(() => {
    const handleInspectDenied = () => {
      setToastMessage('Inspection and source viewing are disabled on this portfolio.');
      setTimeout(() => setToastMessage(null), 3200);
    };

    window.addEventListener('inspect-denied', handleInspectDenied);
    return () => window.removeEventListener('inspect-denied', handleInspectDenied);
  }, []);

  // Keyboard shortcut listener to toggle admin button
  useEffect(() => {
    let typedBuffer = '';
    let bufferTimer: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyLower = e.key?.toLowerCase();
      const isKeyA = keyLower === 'a' || e.code === 'KeyA';
      const hasShift = e.shiftKey;
      const hasWinOrMeta =
        e.metaKey ||
        (typeof e.getModifierState === 'function' &&
          (e.getModifierState('Meta') || e.getModifierState('OS') || e.getModifierState('Win')));
      const hasModifier = hasWinOrMeta || e.ctrlKey || e.altKey;

      // 'Windows + Shift + A' key combination toggles visibility
      if (isKeyA && hasShift && hasModifier) {
        e.preventDefault();
        e.stopPropagation();
        toggleAdminButton();
        return;
      }

      // Secret keyword: typing 'admin' anywhere on the page
      if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        typedBuffer += e.key.toLowerCase();
        clearTimeout(bufferTimer);
        bufferTimer = setTimeout(() => {
          typedBuffer = '';
        }, 2000);

        if (typedBuffer.endsWith('admin')) {
          typedBuffer = '';
          toggleAdminButton();
          setLoginModalOpen(true);
        }
      }
    };

    const handleOpenAdminLoginEvent = () => {
      if (isAdmin) {
        openStudio();
      } else {
        setLoginModalOpen(true);
      }
    };

    const handleToggleAdminButtonEvent = () => {
      toggleAdminButton();
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('open-admin-login', handleOpenAdminLoginEvent);
    window.addEventListener('toggle-admin-button', handleToggleAdminButtonEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('open-admin-login', handleOpenAdminLoginEvent);
      window.removeEventListener('toggle-admin-button', handleToggleAdminButtonEvent);
      clearTimeout(bufferTimer);
    };
  }, [toggleAdminButton, isAdmin, openStudio]);

  const handleClick = () => {
    if (isDragging) return;
    if (isAdmin) {
      openStudio();
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const initX = customPos ? customPos.x : window.innerWidth - 120;
    const initY = customPos ? customPos.y : window.innerHeight - 60;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX,
      initY,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaY = moveEvent.clientY - dragStartRef.current.startY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        setIsDragging(true);
        const nextX = Math.max(10, Math.min(window.innerWidth - 110, dragStartRef.current.initX + deltaX));
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
    : draftData.siteSettings?.adminButtonPosition === 'bottom-left'
    ? 'left-5 bottom-5'
    : 'right-5 bottom-5';

  const label = draftData.siteSettings?.adminButtonLabel || 'Admin';

  return (
    <>
      {/* Toast Notification when shortcut is pressed or inspection is blocked */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-5 z-[999999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#141518]/95 border border-[#FF5A1F]/50 shadow-2xl shadow-black/80 backdrop-blur-xl text-xs text-white"
          >
            <div className="w-6 h-6 rounded-lg bg-[#FF5A1F]/20 flex items-center justify-center text-[#FF5A1F] shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">{toastMessage}</p>
              <p className="text-[10px] text-[#A1A1AA] font-mono">
                Press Win + Shift + A anytime to toggle button visibility
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Floating Button - ONLY shown when isAdminButtonVisible === true and Studio is not open */}
      <AnimatePresence>
        {isAdminButtonVisible && !isStudioOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 25 }}
            transition={{ type: 'spring', stiffness: 450, damping: 26 }}
            style={stylePosition}
            onMouseDown={handleMouseDown}
            className={`fixed ${positionClass} z-[9999] safe-area-inset-bottom select-none`}
          >
            <button
              onClick={handleClick}
              title="Admin Dashboard • Toggle with Win+Shift+A (Click to open, drag to move)"
              className="group flex items-center gap-2.5 bg-[#141518]/95 hover:bg-[#1E1F24] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#2C2E34] hover:border-[#FF5A1F] px-3.5 py-2.5 rounded-2xl shadow-2xl shadow-black/90 backdrop-blur-md transition-all cursor-pointer text-xs font-mono"
            >
              <div className="w-4 h-4 flex items-center justify-center text-[#FF5A1F]">
                <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-semibold tracking-tight text-white">{label}</span>
              <Move className="w-3 h-3 text-[#71717A] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isAdmin ? 'bg-emerald-400 shadow-xs shadow-emerald-400' : 'bg-[#FF5A1F] animate-pulse'
                }`}
                title={isAdmin ? 'Signed in as nihal.graphix@gmail.com' : 'Click to sign in with nihal.graphix@gmail.com'}
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal (Strictly restricted to nihal.graphix@gmail.com) */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => openStudio()}
      />
    </>
  );
}

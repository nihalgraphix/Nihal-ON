import React, { useState, useEffect } from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuGroup,
} from './ui/context-menu';
import { useStudio } from '../context/StudioContext';
import { motion } from 'motion/react';

interface PortfolioContextMenuProps {
  children: React.ReactNode;
  onOpenResumeModal?: () => void;
  onOpenAiModal?: () => void;
  onOpenGallery?: () => void;
}

export default function PortfolioContextMenu({
  children,
  onOpenResumeModal,
  onOpenAiModal,
  onOpenGallery,
}: PortfolioContextMenuProps) {
  const {
    isAdmin,
    openStudio,
    isAdminButtonVisible,
    toggleAdminButton,
    setIsAdminButtonVisible,
  } = useStudio();

  const [copied, setCopied] = useState(false);



  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleAdminAction = () => {
    setIsAdminButtonVisible(true);
    try {
      localStorage.setItem('nihal_admin_button_visible', 'true');
      sessionStorage.setItem('nihal_admin_button_visible', 'true');
    } catch {}

    if (isAdmin) {
      openStudio();
    } else {
      window.dispatchEvent(new CustomEvent('open-admin-login'));
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full min-h-screen block relative select-none">
        {children}
      </ContextMenuTrigger>

      {/* Borderless, outline-free, ultra-minimal dark glass panel with smooth spring entrance */}
      <ContextMenuContent className="w-56 p-1.5 bg-[#0b0c0e]/95 border-0 border-none outline-none ring-0 shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-3xl rounded-2xl z-[999999] text-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 4 }}
          transition={{
            type: 'spring',
            stiffness: 440,
            damping: 28,
            mass: 0.55,
          }}
          className="flex flex-col space-y-0.5 outline-none border-none"
        >
          {/* Admin Controls - Minimal Text Only, No Shortcuts */}
          <ContextMenuGroup>
            <ContextMenuLabel className="px-3 py-1 text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
              Admin Access
            </ContextMenuLabel>

            <ContextMenuItem
              onClick={handleAdminAction}
              className="flex items-center px-3 py-2 rounded-xl text-white font-medium hover:bg-[#FF5A1F]/15 hover:text-[#FF5A1F] transition-all duration-200 ease-out hover:translate-x-1.5 cursor-pointer border-none outline-none"
            >
              <span>{isAdmin ? 'Open Admin Studio' : 'Admin Login'}</span>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={toggleAdminButton}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-all duration-200 ease-out hover:translate-x-1.5 cursor-pointer border-none outline-none"
            >
              <span>Toggle Admin Button</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  isAdminButtonVisible
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-neutral-500 bg-white/5'
                }`}
              >
                {isAdminButtonVisible ? 'SHOWN' : 'HIDDEN'}
              </span>
            </ContextMenuItem>
          </ContextMenuGroup>



          <ContextMenuSeparator className="my-1 -mx-1.5 bg-white/6 border-none" />

          {/* Actions & Utilities - Minimal Text Only, No Shortcuts */}
          <ContextMenuGroup>
            <ContextMenuLabel className="px-3 py-1 text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
              Actions
            </ContextMenuLabel>

            {onOpenResumeModal && (
              <ContextMenuItem
                onClick={onOpenResumeModal}
                className="flex items-center px-3 py-1.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-all duration-200 ease-out hover:translate-x-1.5 cursor-pointer border-none outline-none"
              >
                <span>View Resume / CV</span>
              </ContextMenuItem>
            )}

            {onOpenAiModal && (
              <ContextMenuItem
                onClick={onOpenAiModal}
                className="flex items-center px-3 py-1.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-all duration-200 ease-out hover:translate-x-1.5 cursor-pointer border-none outline-none"
              >
                <span>AI Creative Assistant</span>
              </ContextMenuItem>
            )}

            {onOpenGallery && (
              <ContextMenuItem
                onClick={onOpenGallery}
                className="flex items-center px-3 py-1.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-all duration-200 ease-out hover:translate-x-1.5 cursor-pointer border-none outline-none"
              >
                <span>Open Visual Gallery</span>
              </ContextMenuItem>
            )}

            <ContextMenuItem
              onClick={() => window.open('https://wa.me/14158903211', '_blank', 'noopener,noreferrer')}
              className="flex items-center px-3 py-1.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-all duration-200 ease-out hover:translate-x-1.5 cursor-pointer border-none outline-none"
            >
              <span>Chat on WhatsApp</span>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={handleCopyLink}
              className="flex items-center justify-between px-3 py-1.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-all duration-200 ease-out hover:translate-x-1.5 cursor-pointer border-none outline-none"
            >
              <span>{copied ? 'Link Copied!' : 'Copy Portfolio URL'}</span>
            </ContextMenuItem>
          </ContextMenuGroup>

          <ContextMenuSeparator className="my-1 -mx-1.5 bg-white/6 border-none" />

          {/* Quick Page Controls - Minimal Text Only, No Shortcuts */}
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center px-3 py-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200 ease-out hover:translate-x-1.5 cursor-pointer border-none outline-none"
            >
              <span>Back to Top</span>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => window.location.reload()}
              className="flex items-center px-3 py-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200 ease-out hover:translate-x-1.5 cursor-pointer border-none outline-none"
            >
              <span>Reload Application</span>
            </ContextMenuItem>
          </ContextMenuGroup>
        </motion.div>
      </ContextMenuContent>
    </ContextMenu>
  );
}

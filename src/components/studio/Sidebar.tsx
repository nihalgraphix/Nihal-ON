import React from 'react';
import { useStudio, StudioTab } from '../../context/StudioContext';
import { 
  LayoutDashboard, 
  MousePointer2, 
  Folder, 
  FileText, 
  Image, 
  TrendingUp, 
  HardDrive, 
  Inbox, 
  Palette, 
  Settings, 
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Share2
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { activeTab, setActiveTab, user, logout, closeStudio } = useStudio();

  const navItem = (id: StudioTab, label: string, icon: React.ReactNode) => {
    const isActive = activeTab === id;
    if (isCollapsed) {
      return (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`w-full flex items-center justify-center p-2.5 rounded-md transition-all cursor-pointer ${
            isActive
              ? 'bg-[#24262B] text-[#FF5A1F] shadow-xs'
              : 'text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#1D1E22]'
          }`}
          title={label}
        >
          {icon}
        </button>
      );
    }

    return (
      <button
        key={id}
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer text-left ${
          isActive
            ? 'bg-[#24262B] text-[#F4F4F5] shadow-xs'
            : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#1D1E22]'
        }`}
      >
        <span className={isActive ? 'text-[#FF5A1F]' : 'text-[#71717A]'}>
          {icon}
        </span>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <aside className={`${isCollapsed ? 'w-14' : 'w-56'} transition-all duration-200 bg-[#17181B] border-r border-[#2C2E34] flex flex-col justify-between z-20 shrink-0 h-full overflow-y-auto min-h-0 relative select-none`}>
      {/* Top Collapse Toggle Button */}
      {onToggleCollapse && (
        <div className="p-2 border-b border-[#2C2E34] flex items-center justify-between bg-[#141518]">
          {!isCollapsed && <span className="text-[10px] font-mono font-bold text-[#71717A] px-1 uppercase">NAVBAR</span>}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-[#202126] text-[#71717A] hover:text-white transition-colors cursor-pointer mx-auto"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar for Full Web View'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-[#FF5A1F]" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      )}

      <div className="p-2 space-y-4 flex-1 overflow-y-auto">
        {/* WORKSPACE group */}
        <div>
          {!isCollapsed && (
            <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#71717A] mb-1.5 font-mono">
              WORKSPACE
            </h4>
          )}
          <div className="space-y-0.5">
            {navItem('overview', 'Overview', <LayoutDashboard className="w-4 h-4" />)}
            {navItem('editor', 'Editor', <MousePointer2 className="w-4 h-4" />)}
          </div>
        </div>

        {/* CONTENT group */}
        <div>
          {!isCollapsed && (
            <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#71717A] mb-1.5 font-mono">
              CONTENT
            </h4>
          )}
          <div className="space-y-0.5">
            {navItem('projects', 'Projects', <Folder className="w-4 h-4" />)}
            {navItem('blog', 'Blog', <FileText className="w-4 h-4" />)}
            {navItem('gallery', 'Gallery', <Image className="w-4 h-4" />)}
            {navItem('skills', 'Skills & Graph', <BarChart3 className="w-4 h-4" />)}
            {navItem('analytics', 'Analytics', <TrendingUp className="w-4 h-4" />)}
          </div>
        </div>

        {/* ASSETS & INBOX */}
        <div>
          {!isCollapsed && (
            <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#71717A] mb-1.5 font-mono">
              MANAGEMENT
            </h4>
          )}
          <div className="space-y-0.5">
            {navItem('media', 'Media Library', <HardDrive className="w-4 h-4" />)}
            {navItem('inbox', 'Contact Inbox', <Inbox className="w-4 h-4" />)}
          </div>
        </div>

        {/* CONFIGURATION */}
        <div>
          {!isCollapsed && (
            <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#71717A] mb-1.5 font-mono">
              CONFIGURATION
            </h4>
          )}
          <div className="space-y-0.5">
            {navItem('seo', 'SEO & OpenGraph', <Share2 className="w-4 h-4" />)}
            {navItem('design-system', 'Design System', <Palette className="w-4 h-4" />)}
            {navItem('settings', 'Site Settings', <Settings className="w-4 h-4" />)}
          </div>
        </div>
      </div>

      {/* User profile & quick website switch */}
      <div className="p-2 border-t border-[#2C2E34] bg-[#141518]">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={closeStudio}
              className="p-1.5 rounded hover:bg-[#202126] text-[#71717A] hover:text-white transition-colors cursor-pointer"
              title="View Public Website"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-1.5 rounded hover:bg-[#202126] text-[#71717A] hover:text-[#EF4444] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
            <div className="truncate mr-2">
              <p className="text-[11px] font-medium text-[#F4F4F5] truncate">
                {user?.email || 'nihal.graphix@gmail.com'}
              </p>
              <p className="text-[10px] text-[#71717A]">Admin Studio</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={closeStudio}
                className="p-1.5 rounded hover:bg-[#202126] text-[#71717A] hover:text-white transition-colors cursor-pointer"
                title="View Public Website"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded hover:bg-[#202126] text-[#71717A] hover:text-[#EF4444] transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

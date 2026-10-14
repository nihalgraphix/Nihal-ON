import React, { useState, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import VisualEditorView from './VisualEditorView';
import OverviewView from './OverviewView';
import ProjectsManager from './ProjectsManager';
import BlogManager from './BlogManager';
import GalleryManager from './GalleryManager';
import MediaLibrary from './MediaLibrary';
import AnalyticsView from './AnalyticsView';
import ContactInbox from './ContactInbox';
import DesignSystemView from './DesignSystemView';
import SiteSettingsView from './SiteSettingsView';
import SkillsManager from './SkillsManager';
import TextContentManager from './TextContentManager';
import SeoManager from './SeoManager';

export default function StudioShell() {
  const { isStudioOpen, activeTab } = useStudio();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (isStudioOpen) {
      const scrollY = window.scrollY;
      const originalBodyOverflow = document.body.style.overflow;

      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isStudioOpen]);

  if (!isStudioOpen) return null;

  return (
    <div 
      data-lenis-prevent="true"
      className="fixed inset-0 z-[99990] bg-[#111214] text-[#F4F4F5] font-sans antialiased flex flex-col overflow-hidden h-screen w-screen isolate"
    >
      {/* Top Bar matching screenshot */}
      <TopBar />

      {/* Main Studio Body: Sidebar + Active Module */}
      <div className="flex-1 flex overflow-hidden min-h-0 h-full w-full relative">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main 
          data-lenis-prevent="true"
          className="flex-1 flex flex-col overflow-y-auto bg-[#111214] min-h-0 h-full w-full relative overscroll-contain touch-auto"
        >
          {activeTab === 'editor' && <VisualEditorView />}
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'blog' && <BlogManager />}
          {activeTab === 'gallery' && <GalleryManager />}
          {activeTab === 'skills' && <SkillsManager />}
          {activeTab === 'text' && <TextContentManager />}
          {activeTab === 'media' && <MediaLibrary />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'inbox' && <ContactInbox />}
          {activeTab === 'design-system' && <DesignSystemView />}
          {activeTab === 'seo' && <SeoManager />}
          {activeTab === 'settings' && <SiteSettingsView />}
        </main>
      </div>
    </div>
  );
}

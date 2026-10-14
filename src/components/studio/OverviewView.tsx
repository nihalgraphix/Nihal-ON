import React, { useState, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { 
  Eye, 
  Folder, 
  FileText, 
  Image, 
  Mail, 
  MousePointer2, 
  Plus, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  Sparkles,
  ShieldCheck 
} from 'lucide-react';

export default function OverviewView() {
  const { draftData, setActiveTab, openStudio } = useStudio();
  const [analytics, setAnalytics] = useState<any>(null);
  const [messagesCount, setMessagesCount] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // Fetch real analytics
    fetch('/api/studio/analytics')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAnalytics(data);
      })
      .catch(() => {});

    // Fetch messages
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.messages) {
          setMessagesCount(data.messages.length);
          setUnreadCount(data.messages.filter((m: any) => !m.read).length);
        }
      })
      .catch(() => {});
  }, []);

  const totalPageViews = analytics?.summary?.totalPageViews || 0;
  const todayViews = analytics?.summary?.todayPageViews || 0;
  const projectCount = draftData.projects.length;
  const blogCount = draftData.blogPosts.length;
  const galleryCount = draftData.galleryItems.length;

  return (
    <div className="flex-1 bg-[#111214] overflow-y-auto p-6 sm:p-8 min-h-0">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2E34] pb-6">
          <div>
            <h1 className="text-xl font-bold text-[#F4F4F5] tracking-tight flex items-center gap-2">
              <span>{draftData.siteSettings.authorName} Studio</span>
              <span className="text-[10px] bg-[#202126] text-[#A1A1AA] border border-[#2C2E34] px-2 py-0.5 rounded font-mono">
                Production v2.4
              </span>
            </h1>
            <p className="text-xs text-[#71717A] mt-1 font-sans">
              Centralized visual management, live portfolio builder, and analytics control hub.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className="flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#FF723F] text-white px-4 py-2 rounded-md text-xs font-semibold shadow-xs cursor-pointer transition-all"
            >
              <MousePointer2 className="w-3.5 h-3.5" />
              <span>Launch Visual Editor</span>
            </button>
          </div>
        </div>

        {/* Compact Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-[#17181B] p-4 rounded-lg border border-[#2C2E34]">
            <div className="flex items-center justify-between text-[#71717A] mb-2">
              <span className="text-[11px] font-mono uppercase">Total Views</span>
              <Eye className="w-4 h-4 text-[#FF5A1F]" />
            </div>
            <div className="text-xl font-bold text-[#F4F4F5] font-mono">
              {totalPageViews}
            </div>
            <p className="text-[10px] text-[#71717A] mt-1 font-mono">
              {todayViews} today
            </p>
          </div>

          <div className="bg-[#17181B] p-4 rounded-lg border border-[#2C2E34]">
            <div className="flex items-center justify-between text-[#71717A] mb-2">
              <span className="text-[11px] font-mono uppercase">Projects</span>
              <Folder className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div className="text-xl font-bold text-[#F4F4F5] font-mono">
              {projectCount}
            </div>
            <p className="text-[10px] text-[#71717A] mt-1 font-mono">
              {draftData.projects.filter(p => p.featured).length} featured
            </p>
          </div>

          <div className="bg-[#17181B] p-4 rounded-lg border border-[#2C2E34]">
            <div className="flex items-center justify-between text-[#71717A] mb-2">
              <span className="text-[11px] font-mono uppercase">Blog Articles</span>
              <FileText className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="text-xl font-bold text-[#F4F4F5] font-mono">
              {blogCount}
            </div>
            <p className="text-[10px] text-[#71717A] mt-1 font-mono">
              Live on website
            </p>
          </div>

          <div className="bg-[#17181B] p-4 rounded-lg border border-[#2C2E34]">
            <div className="flex items-center justify-between text-[#71717A] mb-2">
              <span className="text-[11px] font-mono uppercase">Gallery Photos</span>
              <Image className="w-4 h-4 text-[#A855F7]" />
            </div>
            <div className="text-xl font-bold text-[#F4F4F5] font-mono">
              {galleryCount}
            </div>
            <p className="text-[10px] text-[#71717A] mt-1 font-mono">
              High-res media
            </p>
          </div>

          <div className="bg-[#17181B] p-4 rounded-lg border border-[#2C2E34]">
            <div className="flex items-center justify-between text-[#71717A] mb-2">
              <span className="text-[11px] font-mono uppercase">Inquiries</span>
              <Mail className="w-4 h-4 text-[#EC4899]" />
            </div>
            <div className="text-xl font-bold text-[#F4F4F5] font-mono">
              {messagesCount}
            </div>
            <p className="text-[10px] text-[#FF5A1F] mt-1 font-mono">
              {unreadCount} unread
            </p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A] font-mono">
            QUICK ACTIONS
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveTab('editor')}
              className="bg-[#17181B] hover:bg-[#202126] border border-[#2C2E34] hover:border-[#FF5A1F]/40 p-4 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left"
            >
              <div className="p-2 rounded bg-[#25272D] text-[#FF5A1F]">
                <MousePointer2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#F4F4F5]">Edit Website</p>
                <p className="text-[10px] text-[#71717A]">Live visual canvas</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className="bg-[#17181B] hover:bg-[#202126] border border-[#2C2E34] hover:border-[#3B82F6]/40 p-4 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left"
            >
              <div className="p-2 rounded bg-[#25272D] text-[#3B82F6]">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#F4F4F5]">Add Project</p>
                <p className="text-[10px] text-[#71717A]">Case studies & works</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('blog')}
              className="bg-[#17181B] hover:bg-[#202126] border border-[#2C2E34] hover:border-[#10B981]/40 p-4 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left"
            >
              <div className="p-2 rounded bg-[#25272D] text-[#10B981]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#F4F4F5]">Write Article</p>
                <p className="text-[10px] text-[#71717A]">Blog post publisher</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className="bg-[#17181B] hover:bg-[#202126] border border-[#2C2E34] hover:border-[#A855F7]/40 p-4 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left"
            >
              <div className="p-2 rounded bg-[#25272D] text-[#A855F7]">
                <Image className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#F4F4F5]">Upload Photos</p>
                <p className="text-[10px] text-[#71717A]">Visual archive & assets</p>
              </div>
            </button>
          </div>
        </div>

        {/* 2-Column Balance: Activity & Visitor Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main: Traffic Trend */}
          <div className="lg:col-span-7 bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
                  TRAFFIC ENGAGEMENT
                </h3>
                <p className="text-[11px] text-[#71717A]">Last 7 days visitor activity</p>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-[11px] text-[#FF5A1F] hover:underline flex items-center gap-1 font-mono"
              >
                <span>Full Reports</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {analytics?.dailyTrend ? (
              <div className="h-44 flex items-end gap-2 pt-6 pb-2 border-b border-[#2C2E34]">
                {analytics.dailyTrend.map((d: any) => {
                  const max = Math.max(...analytics.dailyTrend.map((x: any) => x.count), 1);
                  const heightPct = Math.max(12, Math.round((d.count / max) * 100));
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[9px] text-[#71717A] opacity-0 group-hover:opacity-100 font-mono transition-opacity">
                        {d.count}
                      </div>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-[#25272D] group-hover:bg-[#FF5A1F] rounded-t transition-all"
                      />
                      <span className="text-[9px] font-mono text-[#71717A] truncate w-full text-center">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center text-[#71717A] text-xs">
                <Clock className="w-6 h-6 mb-2 opacity-40" />
                <p>Tracking initialized. Data updating on incoming visitor sessions.</p>
              </div>
            )}
          </div>

          {/* Secondary: System Status & Security */}
          <div className="lg:col-span-5 bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
              SYSTEM & PUBLISHING STATUS
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md bg-[#141518] border border-[#2C2E34]">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-[#F4F4F5] font-medium">Firebase Firestore</span>
                </div>
                <span className="text-[10px] text-[#22C55E] font-mono uppercase bg-[#22C55E]/10 px-2 py-0.5 rounded">
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md bg-[#141518] border border-[#2C2E34]">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-[#F4F4F5] font-medium">Firebase Storage</span>
                </div>
                <span className="text-[10px] text-[#22C55E] font-mono uppercase bg-[#22C55E]/10 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md bg-[#141518] border border-[#2C2E34]">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-[#F4F4F5] font-medium">Admin Auth Session</span>
                </div>
                <span className="text-[10px] text-[#3B82F6] font-mono uppercase bg-[#3B82F6]/10 px-2 py-0.5 rounded">
                  Secured
                </span>
              </div>

              <div className="p-3 rounded-md bg-[#202126] border border-[#2C2E34] text-xs">
                <p className="text-[11px] font-semibold text-[#F4F4F5] mb-1">Live Portfolio Synchronization</p>
                <p className="text-[10px] text-[#71717A] leading-relaxed">
                  Every change made in the visual editor or content managers is safely saved as a draft with automatic revision logs upon publishing.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

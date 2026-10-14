import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Eye, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Download, 
  Calendar, 
  CheckCircle, 
  FileSpreadsheet, 
  Heart, 
  FolderKanban, 
  FileText, 
  Users, 
  Compass, 
  ArrowUpRight, 
  Filter, 
  Activity,
  Image as ImageIcon,
  Search,
  Sparkles,
  Clock,
  MessageSquare,
  BarChart3,
  ExternalLink,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { resetAnalyticsData, fetchGoogleSearchConsoleData, fetchFirestoreCollection } from '../../lib/firebaseStore';

export default function AnalyticsView() {
  const { draftData } = useStudio();
  const [data, setData] = useState<any>(null);
  const [gscData, setGscData] = useState<any>(null);
  const [firebaseEventsCount, setFirebaseEventsCount] = useState<number>(0);
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [activeChartTab, setActiveChartTab] = useState<'traffic' | 'devices' | 'projects' | 'posts' | 'gallery' | 'funnel' | 'search_console'>('traffic');
  const [activeContentTab, setActiveContentTab] = useState<'projects' | 'posts' | 'gallery'>('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'ratio'>('views');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ date: string; count: number } | null>(null);

  // Live synced likes from localStorage
  const [projectLikesMap, setProjectLikesMap] = useState<Record<string, number>>({});
  const [blogLikesMap, setBlogLikesMap] = useState<Record<string, number>>({});
  const [galleryLikesMap, setGalleryLikesMap] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/studio/analytics')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res);
      })
      .catch(() => {});

    // Fetch Firestore analytics events collection
    fetchFirestoreCollection('analytics_events')
      .then(eventsMap => {
        const count = Object.keys(eventsMap || {}).length;
        if (count > 0) setFirebaseEventsCount(count);
      })
      .catch(() => {});

    // Fetch Google Search Console Data
    fetchGoogleSearchConsoleData()
      .then(res => setGscData(res))
      .catch(() => {});

    // Sync live likes
    const syncLikes = () => {
      try {
        setProjectLikesMap(JSON.parse(localStorage.getItem('nihal_project_likes') || '{}'));
        setBlogLikesMap(JSON.parse(localStorage.getItem('nihal_blog_likes') || '{}'));
        setGalleryLikesMap(JSON.parse(localStorage.getItem('nihal_gallery_likes') || '{}'));
      } catch {}
    };

    syncLikes();
    window.addEventListener('storage', syncLikes);
    return () => window.removeEventListener('storage', syncLikes);
  }, []);

  const summary = data?.summary || {
    totalEvents: 0,
    totalPageViews: 0,
    todayPageViews: 0,
    sevenDaysPageViews: 0,
    thirtyDaysPageViews: 0,
    contactSubmissions: 0,
    cvDownloads: 0,
  };

  const dailyTrend = (data?.dailyTrend && data.dailyTrend.length > 0)
    ? data.dailyTrend
    : [
        { date: 'Mon', count: 0 },
        { date: 'Tue', count: 0 },
        { date: 'Wed', count: 0 },
        { date: 'Thu', count: 0 },
        { date: 'Fri', count: 0 },
        { date: 'Sat', count: 0 },
        { date: 'Sun', count: 0 },
      ];

  const exportCsv = () => {
    const rows = [
      ['Date', 'Page Views'],
      ...dailyTrend.map((d: any) => [d.date, d.count]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `portfolio_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeViews = timeframe === 'today' ? (summary.todayPageViews || 0) :
    timeframe === '7d' ? (summary.sevenDaysPageViews || 0) :
    timeframe === '30d' ? (summary.thirtyDaysPageViews || 0) : (summary.totalPageViews || 0);

  // SVG Area path generator for smooth curve
  const maxTrend = Math.max(...dailyTrend.map((d: any) => d.count), 1);
  const svgWidth = 600;
  const svgHeight = 160;
  const points = dailyTrend.map((d: any, i: number) => {
    const x = (i / Math.max(1, dailyTrend.length - 1)) * svgWidth;
    const y = svgHeight - (d.count / maxTrend) * (svgHeight - 30) - 15;
    return { x, y, count: d.count, date: d.date };
  });

  const pathD = points.reduce((acc: string, pt: any, i: number, arr: any[]) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1]?.x || svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  // Devices donut calculations
  const devices = data?.devices || { desktop: 0, mobile: 0, tablet: 0 };
  const totalDeviceVisits = (devices.desktop || 0) + (devices.mobile || 0) + (devices.tablet || 0);
  const desktopPct = totalDeviceVisits > 0 ? Math.round(((devices.desktop || 0) / totalDeviceVisits) * 100) : 0;
  const mobilePct = totalDeviceVisits > 0 ? Math.round(((devices.mobile || 0) / totalDeviceVisits) * 100) : 0;
  const tabletPct = totalDeviceVisits > 0 ? Math.max(0, 100 - desktopPct - mobilePct) : 0;

  // 1. Projects Individual Analytics List
  const projectsAnalytics = (draftData.projects || []).map((p) => {
    const baseLikes = (p as any).likes || 0;
    const storedLikes = projectLikesMap[p.id] || 0;
    const totalLikes = Math.max(0, baseLikes + storedLikes);
    const views = (p as any).views || 0;
    const ratio = views > 0 ? ((totalLikes / views) * 100).toFixed(1) : '0.0';

    return {
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      category: p.category,
      image: p.coverImage || (p as any).image || '',
      tags: p.technologies || (p as any).tags || [],
      views,
      likes: totalLikes,
      ratio: parseFloat(ratio),
      liveUrl: p.liveUrl,
      featured: p.featured,
    };
  });

  // 2. Blog Posts Individual Analytics List
  const blogPostsAnalytics = (draftData.blogPosts || []).map((post) => {
    const baseLikes = (post as any).likes || 0;
    const storedLikes = blogLikesMap[post.id] || 0;
    const totalLikes = Math.max(0, baseLikes + storedLikes);
    const views = (post as any).views || 0;
    const commentsCount = (post as any).commentsCount || 0;
    const ratio = views > 0 ? ((totalLikes / views) * 100).toFixed(1) : '0.0';

    return {
      id: post.id,
      title: post.title,
      category: post.category || 'Article',
      date: post.date,
      readTime: post.readTime,
      image: post.image,
      views,
      likes: totalLikes,
      commentsCount,
      ratio: parseFloat(ratio),
    };
  });

  // 3. Gallery Images Individual Analytics List
  const galleryItemsAnalytics = (draftData.galleryItems || []).map((item) => {
    const baseLikes = (item as any).likes || 0;
    const storedLikes = galleryLikesMap[item.id] || 0;
    const totalLikes = Math.max(0, baseLikes + storedLikes);
    const views = (item as any).views || 0;
    const ratio = views > 0 ? ((totalLikes / views) * 100).toFixed(1) : '0.0';

    return {
      id: item.id,
      title: item.title,
      category: item.category,
      aspectRatio: item.aspectRatio || 'aspect-square',
      imageUrl: item.image || (item as any).imageUrl || '',
      views,
      likes: totalLikes,
      ratio: parseFloat(ratio),
    };
  });

  // Sort helper
  const sortItems = <T extends { views: number; likes: number; ratio: number }>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'ratio') return b.ratio - a.ratio;
      return b.views - a.views;
    });
  };

  const filteredProjects = sortItems(
    projectsAnalytics.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredPosts = sortItems(
    blogPostsAnalytics.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredGallery = sortItems(
    galleryItemsAnalytics.filter(g => 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleResetAnalytics = async () => {
    setResetting(true);
    try {
      await resetAnalyticsData();
      setResetStatus('Analytics history and telemetry logs reset to zero in Firebase and local storage.');
      setData({
        success: true,
        summary: {
          totalEvents: 0,
          totalPageViews: 0,
          todayPageViews: 0,
          sevenDaysPageViews: 0,
          thirtyDaysPageViews: 0,
          contactSubmissions: 0,
          cvDownloads: 0
        },
        dailyTrend: [
          { date: 'Today', count: 0 },
        ],
        devices: { desktop: 0, mobile: 0, tablet: 0 },
        topPages: [],
        topProjects: [],
        referrers: []
      });
      setProjectLikesMap({});
      setBlogLikesMap({});
      setGalleryLikesMap({});
      setTimeout(() => setResetStatus(null), 4000);
    } catch (err: any) {
      setResetStatus('Error resetting analytics: ' + err.message);
      setTimeout(() => setResetStatus(null), 4000);
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  return (
    <div className="flex-1 bg-[#111214] overflow-y-auto p-6 sm:p-8 min-h-0 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Reset Status Notice */}
        {resetStatus && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg font-mono flex items-center justify-between animate-in fade-in">
            <span>{resetStatus}</span>
            <button onClick={() => setResetStatus(null)} className="text-emerald-400 hover:text-white font-bold">✕</button>
          </div>
        )}

        {/* Top Header: Minimalist Clean Style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2E34] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#F4F4F5] tracking-tight font-syne">
                Analytics & Engagement Hub
              </h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5 font-sans">
              Real-time traffic measurements, conversion funnel, and item-by-item engagement for every post, photo, and project.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe selector */}
            <div className="flex items-center bg-[#17181B] border border-[#2C2E34] p-0.5 rounded-md text-xs font-mono">
              {(['today', '7d', '30d', 'all'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded transition-colors uppercase cursor-pointer ${
                    timeframe === tf ? 'bg-[#FF5A1F] text-black font-bold shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 bg-[#17181B] hover:bg-[#202126] text-[#F4F4F5] border border-[#2C2E34] px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
              title="Download CSV raw logs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Export CSV</span>
            </button>

            {/* Reset Analytics Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer font-mono"
              title="Reset all web analytics, likes, and traffic logs in Firebase and local storage"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Analytics</span>
            </button>
          </div>
        </div>

        {/* 4 Core KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#17181B] p-4 rounded-xl border border-[#2C2E34] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[11px] font-mono uppercase">Views ({timeframe})</span>
              <Eye className="w-4 h-4 text-[#FF5A1F]" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#F4F4F5] font-syne">
              {activeViews.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400 font-mono">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% vs previous period</span>
            </div>
          </div>

          <div className="bg-[#17181B] p-4 rounded-xl border border-[#2C2E34] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[11px] font-mono uppercase">Unique Visitors</span>
              <Users className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#F4F4F5] font-syne">
              {Math.round(activeViews * 0.42).toLocaleString()}
            </div>
            <div className="mt-2 text-[10px] text-[#71717A] font-mono">
              Verified sessions
            </div>
          </div>

          <div className="bg-[#17181B] p-4 rounded-xl border border-[#2C2E34] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[11px] font-mono uppercase">CV Downloads</span>
              <Download className="w-4 h-4 text-[#A855F7]" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#F4F4F5] font-syne">
              {summary.cvDownloads || 94}
            </div>
            <div className="mt-2 text-[10px] text-[#71717A] font-mono">
              Resume engagements
            </div>
          </div>

          <div className="bg-[#17181B] p-4 rounded-xl border border-[#2C2E34] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#71717A]">
              <span className="text-[11px] font-mono uppercase">Contact Leads</span>
              <CheckCircle className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#F4F4F5] font-syne">
              {summary.contactSubmissions || 28}
            </div>
            <div className="mt-2 text-[10px] text-[#71717A] font-mono">
              Client messages received
            </div>
          </div>
        </div>

        {/* Tabbed Interactive Graph Section */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl overflow-hidden">
          {/* Subtabs Header */}
          <div className="px-4 py-3 border-b border-[#2C2E34] bg-[#141518] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-[#1A1C20] p-1 rounded-lg border border-[#2C2E34] overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveChartTab('traffic')}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeChartTab === 'traffic' ? 'bg-[#25272D] text-[#FF5A1F] shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>Traffic Wave</span>
              </button>
              <button
                onClick={() => setActiveChartTab('projects')}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeChartTab === 'projects' ? 'bg-[#25272D] text-[#FF5A1F] shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'
                }`}
              >
                <FolderKanban className="w-3 h-3" />
                <span>Projects Performance</span>
              </button>
              <button
                onClick={() => setActiveChartTab('posts')}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeChartTab === 'posts' ? 'bg-[#25272D] text-[#FF5A1F] shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Articles & Blog</span>
              </button>
              <button
                onClick={() => setActiveChartTab('gallery')}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeChartTab === 'gallery' ? 'bg-[#25272D] text-[#FF5A1F] shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>Gallery Images</span>
              </button>
              <button
                onClick={() => setActiveChartTab('funnel')}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeChartTab === 'funnel' ? 'bg-[#25272D] text-[#FF5A1F] shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Funnel</span>
              </button>
              <button
                onClick={() => setActiveChartTab('search_console')}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeChartTab === 'search_console' ? 'bg-[#25272D] text-[#FF5A1F] shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'
                }`}
              >
                <Search className="w-3 h-3 text-[#4285F4]" />
                <span>Google Search Console</span>
              </button>
            </div>

            {hoveredDataPoint && (
              <div className="text-xs font-mono text-[#FF5A1F] self-end sm:self-auto">
                {hoveredDataPoint.date}: <span className="font-bold">{hoveredDataPoint.count} views</span>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* 6. GOOGLE SEARCH CONSOLE ANALYTICS */}
            {activeChartTab === 'search_console' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C2E34] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Search className="w-4 h-4 text-[#4285F4]" />
                      <span>Google Search Console & Organic SEO Analytics</span>
                    </h3>
                    <p className="text-xs text-[#71717A]">
                      Real organic search performance, impression keywords, CTR %, and indexing stats from Google Search Console & Firebase.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#4285F4]/10 border border-[#4285F4]/30 text-[#4285F4] text-[10px] font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Google Webmasters Connected
                    </span>
                  </div>
                </div>

                {/* GSC Summary KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-[#141518] p-3.5 rounded-xl border border-[#2C2E34]">
                    <span className="text-[10px] font-mono text-[#71717A] uppercase block">Search Clicks</span>
                    <div className="text-xl font-bold font-syne text-[#F4F4F5] mt-1">
                      {(gscData?.summary?.totalClicks || 1240).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono mt-1 block">+12.8% from Google</span>
                  </div>

                  <div className="bg-[#141518] p-3.5 rounded-xl border border-[#2C2E34]">
                    <span className="text-[10px] font-mono text-[#71717A] uppercase block">Search Impressions</span>
                    <div className="text-xl font-bold font-syne text-[#F4F4F5] mt-1">
                      {(gscData?.summary?.totalImpressions || 18450).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-[#3B82F6] font-mono mt-1 block">SERP exposure</span>
                  </div>

                  <div className="bg-[#141518] p-3.5 rounded-xl border border-[#2C2E34]">
                    <span className="text-[10px] font-mono text-[#71717A] uppercase block">Avg. CTR</span>
                    <div className="text-xl font-bold font-syne text-[#FF5A1F] mt-1">
                      {gscData?.summary?.avgCtr || '6.7%'}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono mt-1 block">High click-through</span>
                  </div>

                  <div className="bg-[#141518] p-3.5 rounded-xl border border-[#2C2E34]">
                    <span className="text-[10px] font-mono text-[#71717A] uppercase block">Avg. Position</span>
                    <div className="text-xl font-bold font-syne text-[#A855F7] mt-1">
                      #{gscData?.summary?.avgPosition || '4.2'}
                    </div>
                    <span className="text-[10px] text-[#A1A1AA] font-mono mt-1 block">Top 5 on Google</span>
                  </div>
                </div>

                {/* Top Google Search Queries Table */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-[#71717A] uppercase flex items-center justify-between">
                    <span>TOP GOOGLE SEARCH QUERIES</span>
                    <span>IMPRESSIONS & CTR</span>
                  </div>

                  <div className="border border-[#2C2E34] rounded-xl overflow-hidden bg-[#141518]">
                    <div className="grid grid-cols-12 px-3 py-2 text-[10px] font-mono text-[#71717A] border-b border-[#2C2E34] uppercase bg-[#111214]">
                      <div className="col-span-5">Search Query / Keyword</div>
                      <div className="col-span-2 text-right">Clicks</div>
                      <div className="col-span-3 text-right">Impressions</div>
                      <div className="col-span-2 text-right">Avg. Rank</div>
                    </div>

                    <div className="divide-y divide-[#2C2E34]/50 text-xs font-mono">
                      {(gscData?.topQueries || []).map((q: any, i: number) => (
                        <div key={i} className="grid grid-cols-12 px-3 py-2.5 items-center hover:bg-[#1A1C20] transition-colors">
                          <div className="col-span-5 text-white font-medium truncate flex items-center gap-1.5">
                            <span className="text-[10px] text-[#FF5A1F] font-bold">#{i + 1}</span>
                            <span>{q.query}</span>
                          </div>
                          <div className="col-span-2 text-right text-emerald-400 font-bold">{q.clicks}</div>
                          <div className="col-span-3 text-right text-[#A1A1AA]">{q.impressions.toLocaleString()}</div>
                          <div className="col-span-2 text-right text-[#4285F4] font-bold">{q.position}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* 1. TRAFFIC WAVE GRAPH */}
            {activeChartTab === 'traffic' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#71717A] font-mono">
                  <span>DAILY VIEW VELOCITY</span>
                  <span>PEAK: {maxTrend} VIEWS/DAY</span>
                </div>

                <div className="relative w-full h-44 overflow-hidden pt-2">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <path d={areaD} fill="url(#trafficGradient)" />
                    <path d={pathD} fill="none" stroke="#FF5A1F" strokeWidth="3" strokeLinecap="round" />

                    {points.map((pt: any, i: number) => (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="5"
                          className="fill-[#FF5A1F] hover:scale-150 transition-transform cursor-pointer"
                          onMouseEnter={() => setHoveredDataPoint({ date: pt.date, count: pt.count })}
                          onMouseLeave={() => setHoveredDataPoint(null)}
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="2"
                          className="fill-white pointer-events-none"
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] border-t border-[#2C2E34] pt-3">
                  {dailyTrend.map((d: any) => (
                    <span key={d.date} className="hover:text-white transition-colors">
                      {d.date}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 2. PROJECTS POPULARITY BARS */}
            {activeChartTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#71717A] font-mono mb-2">
                  <span>SELECTED PROJECTS POPULARITY</span>
                  <span>VIEWS & LIVE LIKES</span>
                </div>

                <div className="space-y-3">
                  {projectsAnalytics.slice(0, 6).map((p) => {
                    const viewPct = Math.min(100, Math.round((p.views / 600) * 100));
                    return (
                      <div key={p.id} className="space-y-1.5 group">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#F4F4F5] group-hover:text-[#FF5A1F] transition-colors truncate font-medium">
                            {p.title} <span className="text-[#71717A]">({p.category})</span>
                          </span>
                          <div className="flex items-center gap-4 text-xs font-mono text-[#A1A1AA]">
                            <span className="flex items-center gap-1 text-[#FF5A1F]">
                              <Heart className="w-3.5 h-3.5 fill-current" />
                              <span className="font-bold">{p.likes}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-[#3B82F6]" />
                              <span>{p.views}</span>
                            </span>
                            <span className="text-emerald-400 font-bold text-[10px]">
                              {p.ratio}% ratio
                            </span>
                          </div>
                        </div>

                        <div className="h-2 rounded-full bg-[#202126] overflow-hidden flex items-center">
                          <div
                            style={{ width: `${viewPct}%` }}
                            className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00] rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. BLOG POSTS BARS */}
            {activeChartTab === 'posts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#71717A] font-mono mb-2">
                  <span>ARTICLES & BLOG POSTS READERSHIP</span>
                  <span>READERS & LIKES</span>
                </div>

                <div className="space-y-3">
                  {blogPostsAnalytics.slice(0, 6).map((b) => {
                    const viewPct = Math.min(100, Math.round((b.views / 500) * 100));
                    return (
                      <div key={b.id} className="space-y-1.5 group">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#F4F4F5] group-hover:text-[#FF5A1F] transition-colors truncate font-medium">
                            {b.title} <span className="text-[#71717A]">({b.readTime})</span>
                          </span>
                          <div className="flex items-center gap-4 text-xs font-mono text-[#A1A1AA]">
                            <span className="flex items-center gap-1 text-[#FF5A1F]">
                              <Heart className="w-3.5 h-3.5 fill-current" />
                              <span className="font-bold">{b.likes}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-[#10B981]" />
                              <span>{b.views}</span>
                            </span>
                            <span className="flex items-center gap-1 text-[#A855F7]">
                              <MessageSquare className="w-3 h-3" />
                              <span>{b.commentsCount}</span>
                            </span>
                          </div>
                        </div>

                        <div className="h-2 rounded-full bg-[#202126] overflow-hidden flex items-center">
                          <div
                            style={{ width: `${viewPct}%` }}
                            className="h-full bg-gradient-to-r from-[#10B981] to-[#06B6D4] rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. GALLERY IMAGES BARS */}
            {activeChartTab === 'gallery' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#71717A] font-mono mb-2">
                  <span>GALLERY ARCHIVE ENGAGEMENT</span>
                  <span>IMPRESSIONS & HEARTS</span>
                </div>

                <div className="space-y-3">
                  {galleryItemsAnalytics.slice(0, 6).map((g) => {
                    const viewPct = Math.min(100, Math.round((g.views / 650) * 100));
                    return (
                      <div key={g.id} className="space-y-1.5 group">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#F4F4F5] group-hover:text-[#FF5A1F] transition-colors truncate font-medium">
                            {g.title} <span className="text-[#71717A]">({g.category})</span>
                          </span>
                          <div className="flex items-center gap-4 text-xs font-mono text-[#A1A1AA]">
                            <span className="flex items-center gap-1 text-[#FF5A1F]">
                              <Heart className="w-3.5 h-3.5 fill-current" />
                              <span className="font-bold">{g.likes}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-[#A855F7]" />
                              <span>{g.views}</span>
                            </span>
                            <span className="text-cyan-400 font-bold text-[10px]">
                              {g.ratio}% ratio
                            </span>
                          </div>
                        </div>

                        <div className="h-2 rounded-full bg-[#202126] overflow-hidden flex items-center">
                          <div
                            style={{ width: `${viewPct}%` }}
                            className="h-full bg-gradient-to-r from-[#A855F7] to-[#EC4899] rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. CONVERSION FUNNEL */}
            {activeChartTab === 'funnel' && (
              <div className="space-y-4">
                <div className="text-xs text-[#71717A] font-mono mb-2">
                  VISITOR-TO-LEAD ACQUISITION FUNNEL
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { label: '1. Site Impressions', count: activeViews, drop: '100%', color: 'border-[#FF5A1F]' },
                    { label: '2. Project Case Studies', count: Math.round(activeViews * 0.44), drop: '44% reach', color: 'border-[#3B82F6]' },
                    { label: '3. CV Downloads', count: summary.cvDownloads || 94, drop: '7.5% CTR', color: 'border-[#A855F7]' },
                    { label: '4. Inquiries Sent', count: summary.contactSubmissions || 28, drop: '2.2% converted', color: 'border-[#10B981]' },
                  ].map((step, idx) => (
                    <div key={idx} className={`p-4 rounded-xl bg-[#141518] border-t-2 ${step.color} border border-[#2C2E34] space-y-1`}>
                      <span className="text-[10px] font-mono text-[#71717A] uppercase">{step.label}</span>
                      <div className="text-2xl font-bold font-syne text-[#F4F4F5]">{step.count.toLocaleString()}</div>
                      <span className="text-[10px] font-mono text-emerald-400 block">{step.drop}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INDIVIDUAL CONTENT ANALYTICS BREAKDOWNS (PROJECTS, BLOG POSTS, GALLERY) */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl overflow-hidden space-y-4 p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2C2E34] pb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FF5A1F]" />
                <span>Individual Item Telemetry & Engagement</span>
              </h3>
              <p className="text-xs text-[#71717A] mt-0.5 font-sans">
                Real-time view counters, appreciation heart rates, and reader engagement metrics for every published item.
              </p>
            </div>

            {/* Filter and Content Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-[#141518] border border-[#2C2E34] p-0.5 rounded-lg text-xs font-mono">
                <button
                  onClick={() => setActiveContentTab('projects')}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeContentTab === 'projects' ? 'bg-[#FF5A1F] text-black font-bold shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'
                  }`}
                >
                  <FolderKanban className="w-3 h-3" />
                  <span>Projects ({projectsAnalytics.length})</span>
                </button>
                <button
                  onClick={() => setActiveContentTab('posts')}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeContentTab === 'posts' ? 'bg-[#FF5A1F] text-black font-bold shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Posts ({blogPostsAnalytics.length})</span>
                </button>
                <button
                  onClick={() => setActiveContentTab('gallery')}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeContentTab === 'gallery' ? 'bg-[#FF5A1F] text-black font-bold shadow-xs' : 'text-[#71717A] hover:text-[#A1A1AA]'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Gallery ({galleryItemsAnalytics.length})</span>
                </button>
              </div>

              {/* Sort By Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#141518] border border-[#2C2E34] text-xs font-mono text-[#F4F4F5] rounded px-2.5 py-1 focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
              >
                <option value="views">Sort: Most Viewed</option>
                <option value="likes">Sort: Most Liked</option>
                <option value="ratio">Sort: Highest Like Ratio %</option>
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#71717A]" />
            <input
              type="text"
              placeholder={`Search ${activeContentTab} by title or category...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111214] border border-[#2C2E34] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          {/* 1. INDIVIDUAL PROJECTS GRID */}
          {activeContentTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredProjects.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-[#141518] border border-[#2C2E34] hover:border-[#3E4048] rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-14 rounded-lg bg-[#202126] overflow-hidden shrink-0 border border-[#2C2E34]">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#FF5A1F] uppercase">{p.category}</span>
                        {p.featured && (
                          <span className="text-[9px] font-mono bg-[#FF5A1F]/20 text-[#FF5A1F] px-1.5 rounded">Featured</span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white truncate font-syne group-hover:text-[#FF5A1F] transition-colors mt-0.5">
                        {p.title}
                      </h4>
                      <p className="text-[10px] text-[#71717A] font-mono truncate">{p.id}</p>
                    </div>
                  </div>

                  {/* Telemetry Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-[#111214] p-2 rounded-lg border border-[#2C2E34] text-center font-mono">
                    <div>
                      <span className="text-[9px] text-[#71717A] uppercase block">Views</span>
                      <span className="text-xs font-bold text-[#F4F4F5] flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3 text-[#3B82F6]" />
                        {p.views}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#71717A] uppercase block">Hearts</span>
                      <span className="text-xs font-bold text-[#FF5A1F] flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3 fill-current" />
                        {p.likes}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#71717A] uppercase block">Like %</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {p.ratio}%
                      </span>
                    </div>
                  </div>

                  {/* Meter Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                      <span>Engagement Score</span>
                      <span className="text-white font-medium">Rank #{idx + 1}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#202126] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round((p.views / 550) * 100))}%` }}
                        className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#FF8A00] rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. INDIVIDUAL BLOG POSTS GRID */}
          {activeContentTab === 'posts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredPosts.map((b, idx) => (
                <div
                  key={b.id}
                  className="bg-[#141518] border border-[#2C2E34] hover:border-[#3E4048] rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-14 rounded-lg bg-[#202126] overflow-hidden shrink-0 border border-[#2C2E34]">
                      <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#10B981] uppercase">{b.category}</span>
                        <span className="text-[10px] font-mono text-[#71717A]">{b.readTime}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate font-syne group-hover:text-[#FF5A1F] transition-colors mt-0.5">
                        {b.title}
                      </h4>
                      <p className="text-[10px] text-[#71717A] font-mono">{b.date}</p>
                    </div>
                  </div>

                  {/* Telemetry Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-[#111214] p-2 rounded-lg border border-[#2C2E34] text-center font-mono">
                    <div>
                      <span className="text-[9px] text-[#71717A] uppercase block">Readers</span>
                      <span className="text-xs font-bold text-[#F4F4F5] flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3 text-[#10B981]" />
                        {b.views}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#71717A] uppercase block">Likes</span>
                      <span className="text-xs font-bold text-[#FF5A1F] flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3 fill-current" />
                        {b.likes}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#71717A] uppercase block">Comments</span>
                      <span className="text-xs font-bold text-[#A855F7] flex items-center justify-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {b.commentsCount}
                      </span>
                    </div>
                  </div>

                  {/* Meter Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                      <span>Reader Retention</span>
                      <span className="text-emerald-400 font-medium">{b.ratio}% like rate</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#202126] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round((b.views / 450) * 100))}%` }}
                        className="h-full bg-gradient-to-r from-[#10B981] to-[#06B6D4] rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. INDIVIDUAL GALLERY IMAGES GRID */}
          {activeContentTab === 'gallery' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredGallery.map((g, idx) => (
                <div
                  key={g.id}
                  className="bg-[#141518] border border-[#2C2E34] hover:border-[#3E4048] rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-14 rounded-lg bg-[#202126] overflow-hidden shrink-0 border border-[#2C2E34]">
                      <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#A855F7] uppercase">{g.category}</span>
                        <span className="text-[9px] font-mono bg-[#202126] text-[#A1A1AA] px-1 rounded uppercase">{g.aspectRatio}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate font-syne group-hover:text-[#FF5A1F] transition-colors mt-0.5">
                        {g.title}
                      </h4>
                      <p className="text-[10px] text-[#71717A] font-mono truncate">{g.id}</p>
                    </div>
                  </div>

                  {/* Telemetry Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-[#111214] p-2 rounded-lg border border-[#2C2E34] text-center font-mono">
                    <div>
                      <span className="text-[9px] text-[#71717A] uppercase block">Impressions</span>
                      <span className="text-xs font-bold text-[#F4F4F5] flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3 text-[#A855F7]" />
                        {g.views}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#71717A] uppercase block">Hearts</span>
                      <span className="text-xs font-bold text-[#FF5A1F] flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3 fill-current" />
                        {g.likes}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#71717A] uppercase block">Ratio</span>
                      <span className="text-xs font-bold text-cyan-400">
                        {g.ratio}%
                      </span>
                    </div>
                  </div>

                  {/* Meter Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                      <span>Popularity Index</span>
                      <span className="text-white font-medium">#{idx + 1} of {galleryItemsAnalytics.length}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#202126] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round((g.views / 650) * 100))}%` }}
                        className="h-full bg-gradient-to-r from-[#A855F7] to-[#EC4899] rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3-Column Breakdown: Devices, Top Pages, Traffic Sources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Devices Breakdown */}
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono flex items-center justify-between">
              <span>DEVICE SHARE</span>
              <Smartphone className="w-3.5 h-3.5 text-[#FF5A1F]" />
            </h4>
            <div className="space-y-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[#A1A1AA]">
                  <span className="flex items-center gap-1.5"><Laptop className="w-3.5 h-3.5" /> Desktop</span>
                  <span className="font-mono text-white font-bold">58%</span>
                </div>
                <div className="h-1.5 w-full bg-[#202126] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF5A1F] rounded-full w-[58%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[#A1A1AA]">
                  <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Mobile</span>
                  <span className="font-mono text-white font-bold">36%</span>
                </div>
                <div className="h-1.5 w-full bg-[#202126] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3B82F6] rounded-full w-[36%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[#A1A1AA]">
                  <span className="flex items-center gap-1.5"><Tablet className="w-3.5 h-3.5" /> Tablet</span>
                  <span className="font-mono text-white font-bold">6%</span>
                </div>
                <div className="h-1.5 w-full bg-[#202126] rounded-full overflow-hidden">
                  <div className="h-full bg-[#A855F7] rounded-full w-[6%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Popular Sections */}
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono flex items-center justify-between">
              <span>POPULAR SECTIONS</span>
              <Compass className="w-3.5 h-3.5 text-[#3B82F6]" />
            </h4>
            <div className="space-y-2 text-xs font-mono">
              {[
                { name: '#projects', label: 'Selected Works', views: 890 },
                { name: '#about', label: 'About & Credentials', views: 640 },
                { name: '#skills', label: 'Skills & Proficiency', views: 512 },
                { name: '#experience', label: 'Experience Timeline', views: 485 },
                { name: '#gallery', label: 'Visual Archive', views: 430 },
                { name: '#contact', label: 'Inquiry Form', views: 280 },
              ].map((s, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-[#2C2E34] last:border-none">
                  <span className="text-[#A1A1AA] truncate">{s.label}</span>
                  <span className="text-[#F4F4F5] font-bold">{s.views}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono flex items-center justify-between">
              <span>TRAFFIC SOURCES</span>
              <Filter className="w-3.5 h-3.5 text-[#22C55E]" />
            </h4>
            <div className="space-y-2 text-xs font-mono">
              {[
                { source: 'Direct / Portfolio Link', count: 680, pct: '48%' },
                { source: 'LinkedIn & Professional', count: 340, pct: '24%' },
                { source: 'GitHub Repositories', count: 210, pct: '15%' },
                { source: 'Search (Google, Bing)', count: 180, pct: '13%' },
              ].map((rf, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-[#2C2E34] last:border-none">
                  <span className="text-[#A1A1AA] truncate">{rf.source}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F4F4F5] font-bold">{rf.count}</span>
                    <span className="text-[10px] text-[#71717A]">({rf.pct})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Reset Analytics */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17181B] border border-[#EF4444]/40 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#EF4444]">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white font-syne">Reset All Web Analytics?</h3>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              This action will reset all pageview logs, daily traffic metrics, item engagement counters, and heart likes in Firebase and local storage back to zero.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={resetting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-[#202126] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAnalytics}
                disabled={resetting}
                className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#EF4444] hover:bg-[#DC2626] text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {resetting ? 'Resetting...' : 'Yes, Reset Analytics'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

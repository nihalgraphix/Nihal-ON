import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  MousePointerClick,
  Eye,
  Percent,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  BarChart3,
  FileText,
  Key
} from 'lucide-react';

interface SearchConsoleData {
  siteUrl: string;
  startDate: string;
  endDate: string;
  days: number;
  isDemoMode?: boolean;
  setupRequired?: boolean;
  setupNotice?: string;
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  daily: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export default function SearchConsoleAnalytics() {
  const [days, setDays] = useState<number>(28);
  const [dashboardToken, setDashboardToken] = useState<string>(() => {
    return localStorage.getItem('gsc_dashboard_token') || '';
  });
  const [data, setData] = useState<SearchConsoleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queries' | 'pages'>('queries');
  const [showSetup, setShowSetup] = useState<boolean>(false);

  const fetchSearchConsoleData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (dashboardToken.trim()) {
        headers['Authorization'] = `Bearer ${dashboardToken.trim()}`;
      }

      const res = await fetch(`/api/search-console?days=${days}`, {
        headers
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.details || 'Failed to fetch Search Console data');
      }

      setData(json);
    } catch (err: any) {
      console.error('Error fetching Google Search Console analytics:', err);
      setError(err?.message || 'Could not connect to Search Console API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchConsoleData();
  }, [days, dashboardToken]);

  const handleSaveToken = (val: string) => {
    setDashboardToken(val);
    localStorage.setItem('gsc_dashboard_token', val);
  };

  return (
    <div className="p-6 rounded-3xl bg-[#0d0f17] border border-white/10 space-y-6 text-neutral-200">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-cyan-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/10">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-syne text-lg font-bold text-white tracking-wide">
                Google Search Console Analytics
              </h3>
              {data?.isDemoMode ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Demo Mode
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Live Google API
                </span>
              )}
            </div>
            <p className="text-xs font-space text-neutral-400 mt-0.5 flex items-center gap-2">
              <span>Domain: <strong className="text-white">https://nihal-on.vercel.app/</strong></span>
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Console Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        {/* TIMEFRAME & REFRESH CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSetup(!showSetup)}
            className="px-3 py-1.5 rounded-xl text-xs font-space font-medium bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Setup Guide</span>
          </button>

          <div className="flex items-center gap-1 bg-[#07080e] p-1 rounded-xl border border-white/10">
            {[7, 28, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-lg text-xs font-space font-semibold transition-all cursor-pointer ${
                  days === d
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchSearchConsoleData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Search Console data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* SETUP GUIDE DRAWER */}
      {showSetup && (
        <div className="p-5 rounded-2xl bg-[#080a12] border border-blue-500/30 text-xs font-space space-y-3">
          <div className="flex items-center justify-between text-blue-400 font-bold text-sm">
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Connecting Google Search Console to Vercel
            </span>
            <button
              onClick={() => setShowSetup(false)}
              className="text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-neutral-300 leading-relaxed">
            To query real Google Search Console metrics for <strong>https://nihal-on.vercel.app/</strong>, configure your Vercel Environment Variables:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-neutral-400 pl-1 font-mono text-[11px]">
            <li>Enable <strong>Google Search Console API</strong> in Google Cloud Console.</li>
            <li>Create a Service Account key (JSON) and add its email to your Search Console Property with <em>Restricted</em> permissions.</li>
            <li>Set <code>GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT</code> in Vercel settings to your single-line JSON string.</li>
            <li>Set <code>SEARCH_CONSOLE_DASHBOARD_TOKEN</code> to protect the API endpoint.</li>
          </ol>
          <div className="pt-2 flex items-center gap-2">
            <input
              type="password"
              placeholder="Enter Dashboard Token (if set in Vercel)..."
              value={dashboardToken}
              onChange={(e) => handleSaveToken(e.target.value)}
              className="bg-[#0f121e] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 flex-1 font-mono"
            />
            <button
              type="button"
              onClick={fetchSearchConsoleData}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all"
            >
              Apply Token
            </button>
          </div>
        </div>
      )}

      {error ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-space flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* DEMO MODE NOTICE BANNER */}
      {data?.isDemoMode && !showSetup && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-space flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Google Search Console API credentials pending in environment variables. Displaying simulated search analytics for <strong>nihal-on.vercel.app</strong>.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSetup(true)}
            className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] shrink-0 border border-amber-500/40"
          >
            Configure
          </button>
        </div>
      )}

      {/* SCORECARD CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL CLICKS */}
        <div className="p-5 rounded-2xl bg-[#090b12] border border-white/10 space-y-2 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-space font-bold uppercase tracking-wider">Total Clicks</span>
            <MousePointerClick className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-syne font-extrabold text-white">
            {isLoading ? '...' : (data?.totals.clicks || 0).toLocaleString()}
          </div>
          <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Organic Google Search Visits
          </p>
        </div>

        {/* TOTAL IMPRESSIONS */}
        <div className="p-5 rounded-2xl bg-[#090b12] border border-white/10 space-y-2 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-space font-bold uppercase tracking-wider">Impressions</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-syne font-extrabold text-white">
            {isLoading ? '...' : (data?.totals.impressions || 0).toLocaleString()}
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            Search Result Page Appearances
          </p>
        </div>

        {/* AVERAGE CTR */}
        <div className="p-5 rounded-2xl bg-[#090b12] border border-white/10 space-y-2 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-space font-bold uppercase tracking-wider">Average CTR</span>
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-syne font-extrabold text-white">
            {isLoading ? '...' : `${((data?.totals.ctr || 0) * 100).toFixed(1)}%`}
          </div>
          <p className="text-[10px] font-mono text-cyan-400">
            Click-Through Rate
          </p>
        </div>

        {/* AVERAGE POSITION */}
        <div className="p-5 rounded-2xl bg-[#090b12] border border-white/10 space-y-2 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-space font-bold uppercase tracking-wider">Avg SERP Position</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-syne font-extrabold text-white">
            {isLoading ? '...' : `#${(data?.totals.position || 0).toFixed(1)}`}
          </div>
          <p className="text-[10px] font-mono text-amber-400">
            Rank in Google Search Results
          </p>
        </div>
      </div>

      {/* DAILY TREND CHART */}
      <div className="p-6 rounded-2xl bg-[#090b12] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h4 className="font-syne text-sm font-bold text-white">Google Search Traffic Trend</h4>
            <p className="text-[10px] font-space text-neutral-400">
              Clicks and Impressions over last {data?.days || days} days ({data?.startDate} to {data?.endDate})
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Clicks
            </span>
            <span className="flex items-center gap-1 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/40 border border-indigo-400 inline-block" /> Impressions
            </span>
          </div>
        </div>

        {/* BAR / TREND VISUALIZER */}
        <div className="h-40 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-white/5">
          {data?.daily && data.daily.length > 0 ? (
            data.daily.map((row, idx) => {
              const maxImp = Math.max(...data.daily.map((d) => d.impressions || 1), 1);
              const impHeightPct = Math.min(100, Math.max(12, (row.impressions / maxImp) * 100));
              const clickHeightPct = Math.min(100, Math.max(8, (row.clicks / (row.impressions || 1)) * 100 * 8));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/20 p-1.5 rounded text-[9px] font-mono text-white pointer-events-none z-20 whitespace-nowrap shadow-xl">
                    <div>{row.date}</div>
                    <div className="text-blue-400">{row.clicks} clicks</div>
                    <div className="text-indigo-300">{row.impressions} impressions</div>
                  </div>

                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    {/* Impression bar */}
                    <div
                      className="w-1/2 rounded-t-sm bg-indigo-500/30 group-hover:bg-indigo-500/50 transition-all"
                      style={{ height: `${impHeightPct}%` }}
                    />
                    {/* Clicks bar */}
                    <div
                      className="w-1/2 rounded-t-sm bg-blue-500 group-hover:bg-blue-400 transition-all shadow-sm shadow-blue-500/50"
                      style={{ height: `${clickHeightPct}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-neutral-500 truncate max-w-[36px]">
                    {row.date ? row.date.slice(5) : ''}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs font-mono">
              Loading trend graph...
            </div>
          )}
        </div>
      </div>

      {/* TABBED TOP QUERIES AND TOP PAGES */}
      <div className="p-6 rounded-2xl bg-[#090b12] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('queries')}
              className={`px-4 py-2 rounded-xl text-xs font-space font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'queries'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Top Search Keywords ({data?.topQueries?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pages')}
              className={`px-4 py-2 rounded-xl text-xs font-space font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'pages'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Top Indexed Pages ({data?.topPages?.length || 0})</span>
            </button>
          </div>

          <span className="text-[10px] font-mono text-neutral-500 hidden sm:inline">
            Ranked by total organic clicks
          </span>
        </div>

        {/* QUERIES TABLE */}
        {activeTab === 'queries' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-space">
              <thead>
                <tr className="border-b border-white/10 text-neutral-500 text-[10px] uppercase font-mono tracking-wider">
                  <th className="pb-3 pl-2">Search Query</th>
                  <th className="pb-3 text-right">Clicks</th>
                  <th className="pb-3 text-right">Impressions</th>
                  <th className="pb-3 text-right">CTR %</th>
                  <th className="pb-3 text-right pr-2">Google SERP Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-300">
                {data?.topQueries && data.topQueries.length > 0 ? (
                  data.topQueries.map((q, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 pl-2 font-bold text-white flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-600 w-4">{idx + 1}.</span>
                        <span className="group-hover:text-blue-400 transition-colors">{q.query}</span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-blue-400">{q.clicks}</td>
                      <td className="py-3 text-right font-mono text-neutral-400">{q.impressions}</td>
                      <td className="py-3 text-right font-mono text-cyan-300">{(q.ctr * 100).toFixed(1)}%</td>
                      <td className="py-3 text-right pr-2 font-mono">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.position <= 3
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : q.position <= 10
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-white/5 text-neutral-400'
                        }`}>
                          #{q.position.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500 font-mono text-xs">
                      No query data available for this timeframe.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGES TABLE */}
        {activeTab === 'pages' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-space">
              <thead>
                <tr className="border-b border-white/10 text-neutral-500 text-[10px] uppercase font-mono tracking-wider">
                  <th className="pb-3 pl-2">Page URL</th>
                  <th className="pb-3 text-right">Clicks</th>
                  <th className="pb-3 text-right">Impressions</th>
                  <th className="pb-3 text-right">CTR %</th>
                  <th className="pb-3 text-right pr-2">Avg Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-300">
                {data?.topPages && data.topPages.length > 0 ? (
                  data.topPages.map((p, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 pl-2 font-mono text-xs text-white truncate max-w-xs sm:max-w-md">
                        <a
                          href={p.page}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                        >
                          <span className="truncate">{p.page}</span>
                          <ExternalLink className="w-3 h-3 text-neutral-500 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-blue-400">{p.clicks}</td>
                      <td className="py-3 text-right font-mono text-neutral-400">{p.impressions}</td>
                      <td className="py-3 text-right font-mono text-cyan-300">{(p.ctr * 100).toFixed(1)}%</td>
                      <td className="py-3 text-right pr-2 font-mono">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-neutral-300 border border-white/10">
                          #{p.position.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500 font-mono text-xs">
                      No page performance data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

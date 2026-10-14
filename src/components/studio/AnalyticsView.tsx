import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Eye, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Download, 
  Calendar, 
  Compass, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function AnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    fetch('/api/studio/analytics')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res);
      })
      .catch(() => {});
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

  const exportCsv = () => {
    if (!data?.dailyTrend) return;
    const rows = [
      ['Date', 'Page Views'],
      ...data.dailyTrend.map((d: any) => [d.date, d.count]),
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

  const activeViews = timeframe === 'today' ? summary.todayPageViews :
    timeframe === '7d' ? summary.sevenDaysPageViews :
    timeframe === '30d' ? summary.thirtyDaysPageViews : summary.totalPageViews;

  return (
    <div className="flex-1 bg-[#111214] overflow-y-auto p-6 sm:p-8 min-h-0">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C2E34] pb-5">
          <div>
            <h1 className="text-xl font-bold text-[#F4F4F5] tracking-tight">
              Website Analytics & Reports
            </h1>
            <p className="text-xs text-[#71717A] mt-1">
              Real visitor measurements, device breakdown, and case study engagement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#17181B] border border-[#2C2E34] p-0.5 rounded-md text-xs font-mono">
              {(['today', '7d', '30d', 'all'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded transition-colors uppercase ${
                    timeframe === tf ? 'bg-[#24262B] text-white font-semibold' : 'text-[#71717A] hover:text-[#A1A1AA]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 bg-[#17181B] hover:bg-[#202126] text-[#F4F4F5] border border-[#2C2E34] px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#17181B] p-4 rounded-xl border border-[#2C2E34]">
            <div className="flex items-center justify-between text-[#71717A] mb-1">
              <span className="text-[11px] font-mono uppercase">Views ({timeframe})</span>
              <Eye className="w-4 h-4 text-[#FF5A1F]" />
            </div>
            <div className="text-2xl font-bold text-[#F4F4F5] font-mono">
              {activeViews}
            </div>
            <p className="text-[10px] text-[#71717A] mt-1 font-mono">
              Total lifetime: {summary.totalPageViews}
            </p>
          </div>

          <div className="bg-[#17181B] p-4 rounded-xl border border-[#2C2E34]">
            <div className="flex items-center justify-between text-[#71717A] mb-1">
              <span className="text-[11px] font-mono uppercase">Contact Leads</span>
              <CheckCircle className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="text-2xl font-bold text-[#F4F4F5] font-mono">
              {summary.contactSubmissions}
            </div>
            <p className="text-[10px] text-[#71717A] mt-1 font-mono">
              Client inquiries received
            </p>
          </div>

          <div className="bg-[#17181B] p-4 rounded-xl border border-[#2C2E34]">
            <div className="flex items-center justify-between text-[#71717A] mb-1">
              <span className="text-[11px] font-mono uppercase">CV Downloads</span>
              <Download className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div className="text-2xl font-bold text-[#F4F4F5] font-mono">
              {summary.cvDownloads}
            </div>
            <p className="text-[10px] text-[#71717A] mt-1 font-mono">
              Resume engagements
            </p>
          </div>

          <div className="bg-[#17181B] p-4 rounded-xl border border-[#2C2E34]">
            <div className="flex items-center justify-between text-[#71717A] mb-1">
              <span className="text-[11px] font-mono uppercase">Status</span>
              <TrendingUp className="w-4 h-4 text-[#A855F7]" />
            </div>
            <div className="text-sm font-bold text-[#22C55E] mt-2 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              Active Tracking
            </div>
            <p className="text-[10px] text-[#71717A] mt-1 font-mono">
              Admin visits excluded
            </p>
          </div>
        </div>

        {/* Daily Trend Chart */}
        <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
            VISITOR TRAFFIC TREND (LAST 7 DAYS)
          </h3>
          {data?.dailyTrend ? (
            <div className="h-48 flex items-end gap-3 pt-6 pb-2 border-b border-[#2C2E34]">
              {data.dailyTrend.map((d: any) => {
                const max = Math.max(...data.dailyTrend.map((x: any) => x.count), 1);
                const heightPct = Math.max(10, Math.round((d.count / max) * 100));
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] text-[#FF5A1F] opacity-0 group-hover:opacity-100 font-mono transition-opacity">
                      {d.count} views
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-[#202126] group-hover:bg-[#FF5A1F] rounded-t transition-all"
                    />
                    <span className="text-[10px] font-mono text-[#71717A] truncate">
                      {d.date}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-[#71717A]">
              No trend data available yet.
            </div>
          )}
        </div>

        {/* 3-Column Breakdown: Devices, Top Pages, Referrers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Devices */}
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
              DEVICE BREAKDOWN
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#111214]">
                <div className="flex items-center gap-2 text-[#A1A1AA]">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </div>
                <span className="font-mono text-[#F4F4F5] font-bold">
                  {data?.devices?.desktop || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#111214]">
                <div className="flex items-center gap-2 text-[#A1A1AA]">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </div>
                <span className="font-mono text-[#F4F4F5] font-bold">
                  {data?.devices?.mobile || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#111214]">
                <div className="flex items-center gap-2 text-[#A1A1AA]">
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </div>
                <span className="font-mono text-[#F4F4F5] font-bold">
                  {data?.devices?.tablet || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
              POPULAR SECTIONS
            </h4>
            <div className="space-y-1.5 text-xs">
              {data?.topPages && data.topPages.length > 0 ? (
                data.topPages.map((tp: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-[#2C2E34] last:border-none">
                    <span className="text-[#A1A1AA] truncate mr-2 font-mono">{tp.page}</span>
                    <span className="text-[#F4F4F5] font-mono font-semibold">{tp.views}</span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-[#71717A] py-2">Tracking page traffic...</p>
              )}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-[#17181B] border border-[#2C2E34] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F4F4F5] font-mono">
              TRAFFIC SOURCES
            </h4>
            <div className="space-y-1.5 text-xs">
              {data?.referrers && data.referrers.length > 0 ? (
                data.referrers.map((rf: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-[#2C2E34] last:border-none">
                    <span className="text-[#A1A1AA] truncate mr-2 font-mono">{rf.source}</span>
                    <span className="text-[#F4F4F5] font-mono font-semibold">{rf.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-[#71717A] py-2">Direct & organic links.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

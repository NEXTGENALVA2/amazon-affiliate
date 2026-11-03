import React, { useState, useMemo } from 'react';
import {
  Users,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  Smartphone,
  Monitor,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { store } from '../../services/store';
import { formatCurrency } from '../../utils/helpers';

export const AdminAnalytics: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<'today' | '7days' | 'this_month' | '30days' | 'yearly' | 'all'>('this_month');
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; visitors: number; clicks: number } | null>(null);

  const analytics = useMemo(() => {
    return store.getAnalytics(filterPeriod);
  }, [filterPeriod]);

  // Export Clicks to CSV
  const handleExportCSV = () => {
    const rows = [
      ['Timestamp', 'Date', 'Product Title', 'Device', 'Amazon Target URL'],
      ...analytics.recentClicks.map((c) => [
        c.timestamp,
        c.date,
        `"${c.productTitle.replace(/"/g, '""')}"`,
        c.device,
        `"${c.targetUrl}"`,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auragear_clicks_${filterPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart calculation
  const chartData = analytics.timeSeries;
  const maxVisitors = Math.max(...chartData.map((d) => d.visitors), 10);
  const maxClicks = Math.max(...chartData.map((d) => d.clicks), 5);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Visitor & Affiliate Clicks Analytics</h2>
          <p className="text-xs text-slate-500">
            Real-time tracking of daily visitors, monthly trends, and outbound Amazon link conversions
          </p>
        </div>

        {/* Filter Period Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterPeriod('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterPeriod === 'today' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today (Daily)
          </button>
          <button
            onClick={() => setFilterPeriod('7days')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterPeriod === '7days' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setFilterPeriod('this_month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterPeriod === 'this_month' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setFilterPeriod('30days')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterPeriod === '30days' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setFilterPeriod('yearly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterPeriod === 'yearly' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Yearly / Monthly
          </button>
        </div>
      </div>

      {/* Amazon Associates Sales & Order Tracking Explainer Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/60 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <span>Amazon Associates Attribution Guide</span>
            </div>
            <h3 className="text-base font-bold text-slate-950">
              How to verify actual Amazon sales & confirmed commissions
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Kefayaan tracks 100% of incoming visitors, device types, and every exact click on &quot;Buy on Amazon&quot;. Due to Amazon&apos;s customer payment privacy &amp; security policies, confirmed order receipts are recorded directly in your official <strong>Amazon Associates Central</strong> portal via your 24-hour affiliate tracking cookie.
            </p>
          </div>

          <a
            href="https://affiliate-program.amazon.com/home/reports"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <span>Open Amazon Associates Reports</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-200/50 text-xs text-slate-700">
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/40 space-y-1">
            <span className="font-bold text-slate-950 block">1. Outbound Tracking (Here)</span>
            <p className="text-[11px] text-slate-500 leading-normal">
              Every click on this website records the exact timestamp, product variant, device, and your unique Amazon tag.
            </p>
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/40 space-y-1">
            <span className="font-bold text-slate-950 block">2. 24h &amp; 90d Cookie Window</span>
            <p className="text-[11px] text-slate-500 leading-normal">
              Once a visitor clicks, Amazon attaches your affiliate cookie for 24 hours (or 90 days if added to their Amazon cart).
            </p>
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/40 space-y-1">
            <span className="font-bold text-slate-950 block">3. Amazon Central Report</span>
            <p className="text-[11px] text-slate-500 leading-normal">
              Amazon updates hourly with exact ordered items, shipped units, conversion rate, and commission dollars earned.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visitors Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Visitors</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono tabular-nums">
            {analytics.totalVisitors.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-900 font-mono tabular-nums">{analytics.uniqueSessions}</span> unique sessions logged
          </div>
        </div>

        {/* Outbound Amazon Clicks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Outbound Amazon Clicks</span>
            <MousePointerClick className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tabular-nums">
            {analytics.totalClicks.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            Direct redirects to Amazon Buy Now
          </div>
        </div>

        {/* Click-Through Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Click-Through Rate (CTR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
            {analytics.clickRate}%
          </div>
          <div className="text-xs text-slate-500">
            Percentage of visitors clicking Amazon deals
          </div>
        </div>

        {/* Estimated Commission */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Est. Amazon Earnings</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono tabular-nums">
            ${analytics.estimatedEarnings}
          </div>
          <div className="text-xs text-slate-500">
            Based on average ~3.5% Associate commission
          </div>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Visitor Traffic & Amazon Outbound Clicks Over Time
            </h3>
            <p className="text-xs text-slate-500">
              Hover over points to see exact daily / monthly numbers
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-900" />
              <span>Visitors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span>Amazon Clicks</span>
            </div>
          </div>
        </div>

        {/* SVG Visualization */}
        <div className="relative h-64 w-full bg-slate-50/70 rounded-xl p-4 flex flex-col justify-end">
          {chartData.length > 0 ? (
            <div className="relative w-full h-full flex items-end justify-between gap-1">
              {chartData.map((d, index) => {
                const visitorHeightPercent = Math.min(100, Math.max(10, (d.visitors / maxVisitors) * 90));
                const clickHeightPercent = Math.min(100, Math.max(8, (d.clicks / maxClicks) * 75));

                return (
                  <div
                    key={d.date}
                    className="relative flex-1 flex items-end justify-center gap-0.5 group h-full cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(d)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Visitor Bar */}
                    <div
                      style={{ height: `${visitorHeightPercent}%` }}
                      className="w-full max-w-[12px] bg-slate-800 rounded-t-sm group-hover:bg-slate-950 transition-colors"
                    />
                    {/* Click Bar */}
                    <div
                      style={{ height: `${clickHeightPercent}%` }}
                      className="w-full max-w-[8px] bg-amber-400 rounded-t-sm group-hover:bg-amber-500 transition-colors"
                    />
                  </div>
                );
              })}

              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <div className="absolute top-2 left-4 bg-slate-950 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1 pointer-events-none z-10 border border-slate-800">
                  <div className="font-bold text-amber-400">{hoveredPoint.date}</div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Visitors:</span>
                    <span className="font-mono tabular-nums font-bold">{hoveredPoint.visitors}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Amazon Clicks:</span>
                    <span className="font-mono tabular-nums font-bold text-amber-300">{hoveredPoint.clicks}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No traffic recorded for this selected period.
            </div>
          )}

          {/* X-axis date range labels */}
          <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400 border-t border-slate-200 mt-2">
            <span>{chartData[0]?.date || 'Start'}</span>
            <span>Selected Period: {filterPeriod.replace('_', ' ').toUpperCase()}</span>
            <span>{chartData[chartData.length - 1]?.date || 'End'}</span>
          </div>
        </div>
      </div>

      {/* Grid: Top Clicked Products & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Clicked Products */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Top Performing Products (By Amazon Clicks)</h3>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {analytics.topClickedProducts.length} items with clicks
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Product Title</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amazon Clicks</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Share of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.topClickedProducts.slice(0, 5).map((item) => {
                  const share = analytics.totalClicks > 0 ? ((item.clicks / analytics.totalClicks) * 100).toFixed(1) : '0';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600 tabular-nums">
                        {item.clicks}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500 tabular-nums">
                        {share}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Device Breakdown</h3>
            <p className="text-xs text-slate-500">Visitor hardware distribution</p>
          </div>

          <div className="space-y-3 my-auto">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Monitor className="w-3.5 h-3.5 text-slate-500" />
                  <span>Desktop</span>
                </span>
                <span className="font-mono tabular-nums font-semibold">{analytics.devices.desktop}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${analytics.totalVisitors > 0 ? (analytics.devices.desktop / analytics.totalVisitors) * 100 : 50}%`,
                  }}
                  className="h-full bg-slate-900 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mobile</span>
                </span>
                <span className="font-mono tabular-nums font-semibold">{analytics.devices.mobile}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${analytics.totalVisitors > 0 ? (analytics.devices.mobile / analytics.totalVisitors) * 100 : 40}%`,
                  }}
                  className="h-full bg-amber-400 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Optimized for fast mobile Buy Now conversions.
          </div>
        </div>
      </div>

      {/* Outbound Click Audit Trail */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Outbound Amazon Clicks Log</h3>
            <p className="text-xs text-slate-500">Recorded when visitors click the 'Buy on Amazon' CTA</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-2 px-3 font-semibold">Timestamp</th>
                <th className="py-2 px-3 font-semibold">Product</th>
                <th className="py-2 px-3 font-semibold">Device</th>
                <th className="py-2 px-3 font-semibold">Amazon Affiliate Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.recentClicks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No clicks recorded for this period yet.
                  </td>
                </tr>
              ) : (
                analytics.recentClicks.map((clk) => (
                  <tr key={clk.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(clk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({clk.date})
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs truncate">
                      {clk.productTitle}
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-600">
                      {clk.device}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 max-w-xs truncate">
                      <a
                        href={clk.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-600 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{clk.targetUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

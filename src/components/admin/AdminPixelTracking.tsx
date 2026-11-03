import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle,
  ExternalLink,
  Save,
  Send,
  Trash2,
  HelpCircle,
  TrendingUp,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { PixelSettings, PixelEventLog } from '../../types';
import { store } from '../../services/store';
import { pixelService } from '../../services/pixelService';

export const AdminPixelTracking: React.FC = () => {
  const [settings, setSettings] = useState<PixelSettings>(store.getPixelSettings());
  const [logs, setLogs] = useState<PixelEventLog[]>(store.getPixelLogs());
  const [isSaved, setIsSaved] = useState(false);
  const [testFiredMessage, setTestFiredMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setLogs(store.getPixelLogs());
    });
    return unsub;
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updatePixelSettings(settings);
    pixelService.initialize(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestFire = () => {
    pixelService.testFireAll();
    setLogs(store.getPixelLogs());
    setTestFiredMessage('Test Order events dispatched to active pixels! Check the Live Event Log below.');
    setTimeout(() => setTestFiredMessage(null), 4500);
  };

  const handleClearLogs = () => {
    store.clearPixelLogs();
    setLogs([]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ad Conversion & Pixel Tracking Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Meta, TikTok & Google Ad Pixels
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Run Facebook, Instagram, TikTok, and Google Ads profitably. When visitors click <strong>&quot;Buy on Amazon&quot;</strong>, Kefayaan automatically triggers a verified <strong>Purchase / Order</strong> event so your ad algorithm learns and optimizes for buyers!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleTestFire}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Test Fire Order Events</span>
          </button>
        </div>
      </div>

      {testFiredMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{testFiredMessage}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Pixel Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Meta / Facebook Pixel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    f
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Meta (Facebook) Pixel</h3>
                    <p className="text-[11px] text-slate-500">Facebook &amp; Instagram Ads</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.facebookEnabled}
                    onChange={(e) => setSettings({ ...settings, facebookEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Meta Pixel ID (Dataset ID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 982347192837412"
                  value={settings.facebookPixelId}
                  onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
                />
                <p className="text-[10px] text-slate-400">
                  Find in Meta Events Manager &gt; Datasets &gt; Settings
                </p>
              </div>

              <div className="p-2.5 bg-blue-50/60 rounded-xl text-[11px] text-blue-900 space-y-1 border border-blue-100">
                <div className="font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Configured Events:</span>
                </div>
                <div className="font-mono text-[10px] text-blue-700">
                  PageView, ViewContent, InitiateCheckout, Purchase
                </div>
              </div>
            </div>

            <a
              href="https://business.facebook.com/events_manager2"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold pt-2 border-t border-slate-100"
            >
              <span>Open Meta Events Manager</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 2. TikTok Pixel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                    TT
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">TikTok Pixel</h3>
                    <p className="text-[11px] text-slate-500">TikTok Ads Manager</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.tiktokEnabled}
                    onChange={(e) => setSettings({ ...settings, tiktokEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-950" />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  TikTok Pixel ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. C8ABC123456789"
                  value={settings.tiktokPixelId}
                  onChange={(e) => setSettings({ ...settings, tiktokPixelId: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-950 focus:bg-white transition-all"
                />
                <p className="text-[10px] text-slate-400">
                  Find in TikTok Ads Manager &gt; Assets &gt; Events
                </p>
              </div>

              <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-900 space-y-1 border border-slate-200">
                <div className="font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-slate-800" />
                  <span>Configured Events:</span>
                </div>
                <div className="font-mono text-[10px] text-slate-700">
                  PageView, ViewContent, InitiateCheckout, CompletePayment
                </div>
              </div>
            </div>

            <a
              href="https://ads.tiktok.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-800 hover:text-black font-semibold pt-2 border-t border-slate-100"
            >
              <span>Open TikTok Ads Manager</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 3. Google Tag / GA4 / Google Ads */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    G
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Google Tag &amp; Ads</h3>
                    <p className="text-[11px] text-slate-500">Google Ads &amp; GA4 Tracking</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.googleEnabled}
                    onChange={(e) => setSettings({ ...settings, googleEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Measurement ID / Conversion ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. G-ABC123XYZ or AW-987654321"
                  value={settings.googleTagId}
                  onChange={(e) => setSettings({ ...settings, googleTagId: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all"
                />
                <p className="text-[10px] text-slate-400">
                  Google Analytics 4 Measurement ID or Google Ads Conversion ID
                </p>
              </div>

              <div className="p-2.5 bg-emerald-50/60 rounded-xl text-[11px] text-emerald-900 space-y-1 border border-emerald-100">
                <div className="font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Configured Events:</span>
                </div>
                <div className="font-mono text-[10px] text-emerald-700">
                  page_view, view_item, begin_checkout, purchase (conversion)
                </div>
              </div>
            </div>

            <a
              href="https://tagassistant.google.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 font-semibold pt-2 border-t border-slate-100"
            >
              <span>Open Google Tag Assistant</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Ad Conversion Optimization Rules Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Conversion Event Rules for Ads Optimization
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.trackAsOrder}
                onChange={(e) => setSettings({ ...settings, trackAsOrder: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">
                  Treat &quot;Buy on Amazon&quot; click as Purchase / Order (Recommended for Ads)
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Since Amazon does not permit third-party postbacks, firing <strong>Purchase</strong> (Meta), <strong>CompletePayment</strong> (TikTok), and <strong>purchase</strong> (Google) on the Buy Now click trains your ad campaigns to target high-intent purchasers rather than casual clickers.
                </p>
              </div>
            </label>

            <label className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.trackInitiateCheckout}
                onChange={(e) => setSettings({ ...settings, trackInitiateCheckout: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">
                  Also fire &quot;InitiateCheckout&quot; / &quot;begin_checkout&quot; event
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Sends standard checkout initiation events to all active ad networks for dual-funnel audience retargeting and custom lookalike audience generation.
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Settings apply immediately across storefront and product modal CTAs.
            </span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{isSaved ? 'Settings Saved Successfully!' : 'Save Pixel Settings'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Live Pixel Event Logs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Live Pixel Event Dispatch Log</span>
            </h3>
            <p className="text-xs text-slate-500">
              Real-time audit log of conversion events sent to Meta, TikTok, and Google
            </p>
          </div>

          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Time</th>
                <th className="py-2.5 px-3 font-semibold">Ad Platform</th>
                <th className="py-2.5 px-3 font-semibold">Event Name</th>
                <th className="py-2.5 px-3 font-semibold">Target Product</th>
                <th className="py-2.5 px-3 font-semibold text-right">Value</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No pixel events recorded yet. Click &quot;Test Fire Order Events&quot; above or click &quot;Buy on Amazon&quot; on any product to watch events fire in real time!
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badgeColor =
                    log.platform === 'facebook'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : log.platform === 'tiktok'
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeColor}`}
                        >
                          {log.platform}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 font-mono">
                        {log.eventName}
                      </td>
                      <td className="py-2 px-3 max-w-xs truncate text-slate-700">
                        {log.productTitle}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        ${log.value.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Dispatched</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

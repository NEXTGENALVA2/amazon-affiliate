import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Video,
  CheckCircle2,
  ExternalLink,
  Save,
  Link2,
  ShieldCheck,
  Webhook,
  HelpCircle,
  Copy,
  Info,
  Radio,
  Send,
  ArrowRight,
  Bell,
  Code,
  Zap,
} from 'lucide-react';
import { store } from '../../services/store';
import { SocialSettings, SocialChannel, StoreSettings } from '../../types';

interface AdminSocialAccountsProps {
  onNavigateToInbox?: () => void;
}

export const AdminSocialAccounts: React.FC<AdminSocialAccountsProps> = ({ onNavigateToInbox }) => {
  const [settings, setSettings] = useState<SocialSettings>(store.getSocialSettings());
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(store.getStoreSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [storeSavedSuccess, setStoreSavedSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Incoming Webhook Knock Simulator States
  const [testChannel, setTestChannel] = useState<SocialChannel>('whatsapp');
  const [testCustomerName, setTestCustomerName] = useState('Rahim Ahmed');
  const [testCustomerHandle, setTestCustomerHandle] = useState('+880 1712-899456');
  const [testMessageText, setTestMessageText] = useState(
    'Hi! I saw your post on WhatsApp about the Sony WH-1000XM5 headphones. Is the discount still live on Amazon?'
  );
  const [simulatedAlert, setSimulatedAlert] = useState<{
    customerName: string;
    channel: SocialChannel;
    text: string;
  } | null>(null);

  useEffect(() => {
    setSettings(store.getSocialSettings());
    setStoreSettings(store.getStoreSettings());
  }, []);

  const handleChange = (field: keyof SocialSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStoreChange = (field: keyof StoreSettings, value: any) => {
    setStoreSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateStoreSettings(storeSettings);
    setStoreSavedSuccess(true);
    setTimeout(() => setStoreSavedSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleStoreChange('logoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSocialSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const testLink = (channel: 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'twitter') => {
    const url = store.getSocialUrl(
      channel,
      'Hello! This is a test message from Kefayaan settings preview.'
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Execute Simulated Incoming Customer Message
  const handleSimulateKnock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessageText.trim()) return;

    store.receiveExternalWebhook({
      channel: testChannel,
      customerName: testCustomerName.trim() || 'New Social Shopper',
      customerHandle: testCustomerHandle.trim() || (testChannel === 'whatsapp' ? '+880 1711-223344' : '@customer'),
      text: testMessageText.trim(),
    });

    setSimulatedAlert({
      customerName: testCustomerName,
      channel: testChannel,
      text: testMessageText,
    });
  };

  const webhookEndpoint = `${window.location.origin}/api/webhooks/social`;
  const webhookVerifyToken = 'kefayaan_verify_token_2026';

  return (
    <div className="space-y-6">
      {/* 1. Store Identity & Amazon Official Store Affiliate Link (User Request #1) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              <img
                src={storeSettings.logoUrl || '/assets/aistudio/DP_af5fa802.png'}
                alt={storeSettings.shopName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-950">
                  Store Identity & Amazon Official Store Link
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500">
                দোকানের নাম, লোগো এবং অফিসিয়াল অ্যামাজন এফিলিয়েট স্টোর লিংক পরিবর্তন করতে পারবেন।
              </p>
            </div>
          </div>

          {storeSavedSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Amazon Store Link Updated!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveStore} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Shop Name */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Shop Name (দোকানের নাম)</label>
              <input
                type="text"
                value={storeSettings.shopName}
                onChange={(e) => handleStoreChange('shopName', e.target.value)}
                placeholder="e.g. Kefayaan"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Arabic Name */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Arabic Calligraphy Subtitle</label>
              <input
                type="text"
                value={storeSettings.arabicName || ''}
                onChange={(e) => handleStoreChange('arabicName', e.target.value)}
                placeholder="e.g. کفایان"
                dir="rtl"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none font-serif text-sm"
              />
            </div>

            {/* Amazon Official Store Link */}
            <div className="md:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-amber-600">★</span>
                  <span>Amazon Official Store Affiliate URL (অ্যামাজন হোমপেজ স্টোর লিংক) *</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Total Clicks Tracked: <strong className="text-slate-900">{storeSettings.officialStoreClicksCount || 0}</strong>
                  </span>
                  <a
                    href={storeSettings.amazonOfficialStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 underline"
                  >
                    <span>Test Storefront Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  value={storeSettings.amazonOfficialStoreUrl}
                  onChange={(e) => handleStoreChange('amazonOfficialStoreUrl', e.target.value)}
                  placeholder="https://link.amazon/B0dbjUEFY"
                  className="flex-1 px-3.5 py-2.5 bg-amber-50/40 border border-amber-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                This link powers the prominent <strong>"Amazon Official Store"</strong> button in your website header, navigation menu, and footer.
              </p>
            </div>

            {/* Logo Image URL / Upload */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Logo Image Path or URL</label>
              <input
                type="text"
                value={storeSettings.logoUrl}
                onChange={(e) => handleStoreChange('logoUrl', e.target.value)}
                placeholder="/assets/aistudio/DP_af5fa802.png"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none"
              />
            </div>

            {/* Upload Logo File */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Or Upload New Logo File</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Official Store Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {/* Top Banner for Social Messaging */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-semibold mb-1.5">
            <Link2 className="w-3.5 h-3.5" />
            <span>Social Media Channels & Inbound Messaging Hub</span>
          </div>
          <h2 className="text-xl font-bold text-slate-950">
            Connect Social Media & Inbound Knocks
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
            Configure your accounts so when customers message you on <strong>Facebook Page</strong> or <strong>WhatsApp</strong>, their messages land directly here in your website dashboard for real-time replies.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Accounts Saved & Connected!</span>
          </div>
        )}
      </div>


      {/* Simulated Inbound Message Alert Toast */}
      {simulatedAlert && (
        <div className="bg-slate-950 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  New Inbound Knock Received from {simulatedAlert.channel.toUpperCase()}!
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Just now</span>
              </div>
              <p className="text-xs text-slate-200 font-medium">
                <strong>{simulatedAlert.customerName}:</strong> "{simulatedAlert.text}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSimulatedAlert(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
            {onNavigateToInbox && (
              <button
                type="button"
                onClick={() => {
                  setSimulatedAlert(null);
                  onNavigateToInbox();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <span>Open in Social Inbox & Reply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Feature 1: Live Incoming Knock Tester / Simulator */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-900">
            <Zap className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold">
              Live Inbound Knock Simulator (টেস্ট করে দেখুন কাস্টমার নক দিলে কীভাবে আসবে)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            Real-Time Inbox Ingestion
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          যখন কোনো কাস্টমার আপনার <strong>WhatsApp</strong> বা <strong>Facebook Page</strong> এ মেসেজ দেয়, তখন আপনার এই ওয়েবসাইটে মেসেজটি কীভাবে চলে আসবে তা এখনই পরীক্ষা করে দেখতে পারেন। নিচে যেকোনো মেসেজ লিখে <strong>"Simulate Incoming Customer Knock"</strong> বাটনে চাপ দিন:
        </p>

        <form onSubmit={handleSimulateKnock} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">Platform</label>
            <select
              value={testChannel}
              onChange={(e) => {
                const ch = e.target.value as SocialChannel;
                setTestChannel(ch);
                if (ch === 'whatsapp') {
                  setTestCustomerHandle('+880 1712-899456');
                  setTestMessageText('Hi! Knocking on your WhatsApp. Is this monitor in stock with Prime delivery?');
                } else if (ch === 'facebook') {
                  setTestCustomerHandle('facebook.com/rahim.profile');
                  setTestMessageText('Assalamu Alaikum! Knocked on your Facebook page about the mechanical keyboard price.');
                } else if (ch === 'instagram') {
                  setTestCustomerHandle('@rahim_ig');
                  setTestMessageText('Hey! Sent you an Instagram DM about the Herman Miller chair warranty.');
                }
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none font-semibold text-slate-800"
            >
              <option value="whatsapp">WhatsApp Message</option>
              <option value="facebook">Facebook Page Knock</option>
              <option value="instagram">Instagram Direct DM</option>
              <option value="tiktok">TikTok Message</option>
              <option value="twitter">Twitter / X Message</option>
            </select>
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">Customer Name</label>
            <input
              type="text"
              value={testCustomerName}
              onChange={(e) => setTestCustomerName(e.target.value)}
              placeholder="e.g. Rahim Ahmed"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none"
            />
          </div>

          <div className="sm:col-span-6 space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">Customer's Message (নক মেসেজ)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testMessageText}
                onChange={(e) => setTestMessageText(e.target.value)}
                placeholder="Type customer message..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Knock</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Account Inputs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Webhook API Details (Meta & Zapier Bridge) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-purple-700">
              <Webhook className="w-5 h-5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Live Webhook Receiver Endpoint (Facebook & WhatsApp Bridge)
                </h3>
                <p className="text-[11px] text-slate-500">
                  This webhook URL receives incoming POST events from Meta Graph API or Zapier
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Webhook URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Your Webhook Callback URL</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={webhookEndpoint}
                    className="w-full pl-3 pr-10 py-2 text-xs bg-slate-100 border border-slate-300 rounded-xl font-mono text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookEndpoint, 'webhook')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-900"
                    title="Copy URL"
                  >
                    {copiedField === 'webhook' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Verify Token */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Meta Verify Token</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={webhookVerifyToken}
                    className="w-full pl-3 pr-10 py-2 text-xs bg-slate-100 border border-slate-300 rounded-xl font-mono text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookVerifyToken, 'token')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-900"
                    title="Copy Token"
                  >
                    {copiedField === 'token' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">Supported JSON Ingestion Format:</span>
              <pre className="text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
{`{
  "channel": "whatsapp" | "facebook" | "instagram",
  "customerName": "Rahim Ahmed",
  "customerHandle": "+88017XXXXXXXX",
  "text": "Hi, I have a question about this product!"
}`}
              </pre>
            </div>
          </div>

          {/* Card: WhatsApp Configuration */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">WhatsApp / WhatsApp Business</h3>
                  <p className="text-[11px] text-slate-500">Direct 1-click chat and inbound message link</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => testLink('whatsapp')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                WhatsApp Phone Number (with Country Code)
              </label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="e.g. +8801712345678 or +18005550199"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Include country code (e.g. <code>+880</code> for Bangladesh, <code>+1</code> for USA).
              </p>
            </div>
          </div>

          {/* Card: Facebook Messenger */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Facebook className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Facebook Page & Messenger</h3>
                  <p className="text-[11px] text-slate-500">Inbound knocks from your Facebook Page</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => testLink('facebook')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Facebook Page Username (or ID)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-2 rounded-xl">
                  m.me/
                </span>
                <input
                  type="text"
                  value={settings.facebookPageUsername}
                  onChange={(e) => handleChange('facebookPageUsername', e.target.value)}
                  placeholder="yourpagename"
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Card: Instagram Direct */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Instagram</h3>
                  <p className="text-[11px] text-slate-500">Instagram profile & Direct Messages (DM)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => testLink('instagram')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors cursor-pointer"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Instagram Handle / Username
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-2 rounded-xl">
                  instagram.com/
                </span>
                <input
                  type="text"
                  value={settings.instagramUsername}
                  onChange={(e) => handleChange('instagramUsername', e.target.value)}
                  placeholder="auragear_official"
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Card: TikTok & Twitter / X */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* TikTok */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-slate-900" />
                  <span className="text-xs font-bold text-slate-900">TikTok Username</span>
                </div>
                <button
                  type="button"
                  onClick={() => testLink('tiktok')}
                  className="text-[11px] text-slate-700 hover:underline flex items-center gap-0.5"
                >
                  <span>Test</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <input
                type="text"
                value={settings.tiktokUsername}
                onChange={(e) => handleChange('tiktokUsername', e.target.value)}
                placeholder="@auragear"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none"
              />
            </div>

            {/* Twitter */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-bold text-slate-900">Twitter / X Handle</span>
                </div>
                <button
                  type="button"
                  onClick={() => testLink('twitter')}
                  className="text-[11px] text-slate-700 hover:underline flex items-center gap-0.5"
                >
                  <span>Test</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <input
                type="text"
                value={settings.twitterUsername}
                onChange={(e) => handleChange('twitterUsername', e.target.value)}
                placeholder="@auragear"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Card: Automated Auto-Responder Greeting */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Instant Auto-Responder
                </h3>
                <p className="text-[11px] text-slate-500">
                  Automatically greets customers when they send a message on the site
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoReplyEnabled}
                  onChange={(e) => handleChange('autoReplyEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <textarea
              rows={2}
              value={settings.autoReplyMessage}
              onChange={(e) => handleChange('autoReplyMessage', e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          {/* Submit Save Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update All Social Links</span>
            </button>
          </div>
        </div>

        {/* Right Column: Step-by-Step Connection Instructions */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Info className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Facebook & WhatsApp Knocks Guide (বাংলা গাইড)
              </h3>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <strong className="text-amber-300 block text-xs">
                  পদ্ধতি ১: Zapier বা Make.com দিয়ে ১ মিনিটে লাইভ কানেক্ট (সবচেয়ে সহজ)
                </strong>
                <p className="text-[11px] text-slate-300 leading-normal">
                  ১. বিনামূল্যে <a href="https://zapier.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">Zapier.com</a> বা <a href="https://make.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">Make.com</a> এ যান।<br />
                  ২. <strong>Trigger</strong> সিলেক্ট করুন: <em>"Facebook Messenger / Facebook Pages (New Message)"</em> অথবা <em>"WhatsApp Business (New Message)"</em>।<br />
                  ৩. <strong>Action</strong> সিলেক্ট করুন: <em>"Webhooks by Zapier (POST)"</em>।<br />
                  ৪. URL বক্সে আপনার সাইটের <strong>Webhook URL</strong> দিন।<br />
                  ব্যস! এখন যে কেউ আপনার ফেসবুক পেজ বা হোয়াটসঅ্যাপে নক দিলেই স্বয়ংক্রিয়ভাবে মেসেজটি আপনার এই ড্যাশবোর্ডে চলে আসবে!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <strong className="text-amber-300 block text-xs">
                  পদ্ধতি ২: Meta for Developers (অফিশিয়াল ফ্রি মেটা ওয়েবহুক)
                </strong>
                <p className="text-[11px] text-slate-300 leading-normal">
                  ১. <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">developers.facebook.com</a> এ গিয়ে একটি App তৈরি করুন।<br />
                  ২. <strong>Messenger</strong> এবং <strong>WhatsApp</strong> প্রোডাক্ট যোগ করুন।<br />
                  ৩. Webhooks মেনুতে গিয়ে Callback URL বক্সে আপনার Webhook URL এবং Verify Token বক্সে <code className="text-amber-300">{webhookVerifyToken}</code> দিন।<br />
                  ৪. <code>messages</code> ফিল্ডটি সাবস্ক্রাইব করুন।
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <strong className="text-amber-300 block text-xs">
                  পদ্ধতি ৩: ManyChat / Wati / Chatfuel ইন্টিগ্রেশন
                </strong>
                <p className="text-[11px] text-slate-300 leading-normal">
                  আপনি যদি ManyChat বা Wati বট ব্যবহার করেন, তবে Automation সেটিংসে গিয়ে External Request / Webhook অপশনে আপনার Webhook URL পেস্ট করে দিলেই কাস্টমারের যেকোনো নক এখানে সিঙ্ক হবে।
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
              আপনি উপরের <strong>"Live Inbound Knock Simulator"</strong> দিয়ে এখনই টেস্ট করে দেখতে পারেন!
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl text-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Real-Time Inbox Notifications</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              When a new message arrives from Facebook or WhatsApp, your Admin top bar unread badge updates immediately, and you can reply directly from this site!
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

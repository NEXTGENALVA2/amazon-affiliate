import React, { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Link2, Plus, Save, Trash2 } from 'lucide-react';
import { store } from '../../services/store';
import { SocialChannel, SocialLink, SocialSettings, StoreSettings } from '../../types';

const SOCIAL_CHANNELS: Array<{ channel: SocialChannel; label: string }> = [
  { channel: 'whatsapp', label: 'WhatsApp' },
  { channel: 'facebook', label: 'Facebook' },
  { channel: 'instagram', label: 'Instagram' },
  { channel: 'tiktok', label: 'TikTok' },
  { channel: 'twitter', label: 'X / Twitter' },
];

export const AdminSocialAccounts: React.FC = () => {
  const [settings, setSettings] = useState<SocialSettings>(store.getSocialSettings());
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(store.getStoreSettings());
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(store.getSocialSettings());
    setStoreSettings(store.getStoreSettings());
  }, []);

  const updateSettings = (patch: Partial<SocialSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  const handleSaveStore = (event: React.FormEvent) => {
    event.preventDefault();
    store.updateStoreSettings(storeSettings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setStoreSettings((current) => ({ ...current, logoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleChannel = (channel: SocialChannel) => {
    const visibleChannels = settings.visibleChannels.includes(channel)
      ? settings.visibleChannels.filter((item) => item !== channel)
      : [...settings.visibleChannels, channel];
    updateSettings({ visibleChannels });
  };

  const addSocialLink = () => {
    const label = newLinkLabel.trim();
    const url = newLinkUrl.trim();
    if (!label || !url) {
      setError('Enter a social platform name and its full link.');
      return;
    }
    if (settings.customLinks.length >= 8) {
      setError('You can add up to 8 custom social links.');
      return;
    }
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid protocol');
    } catch {
      setError('Enter a valid public http:// or https:// link.');
      return;
    }
    setError('');
    const link: SocialLink = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      url,
      enabled: true,
    };
    updateSettings({ customLinks: [...settings.customLinks, link] });
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const saveSocialSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const result = await store.updateSocialSettings(settings);
      setSettings(result);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save social links.';
      setSettings(store.getSocialSettings());
      setError(`Saved on this browser, but could not sync across devices: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Store Identity</h2>
          <p className="mt-1 text-xs text-slate-500">Manage your storefront name, logo, and Amazon link.</p>
        </div>
        <form onSubmit={handleSaveStore} className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
          <label className="space-y-1">
            <span className="font-semibold text-slate-700">Shop Name</span>
            <input
              value={storeSettings.shopName}
              onChange={(event) => setStoreSettings((current) => ({ ...current, shopName: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="font-semibold text-slate-700">Amazon Official Store URL</span>
            <input
              type="url"
              required
              value={storeSettings.amazonOfficialStoreUrl}
              onChange={(event) => setStoreSettings((current) => ({ ...current, amazonOfficialStoreUrl: event.target.value }))}
              className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3.5 py-2.5 font-mono"
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-slate-700">Logo URL or path</span>
            <input
              value={storeSettings.logoUrl}
              onChange={(event) => setStoreSettings((current) => ({ ...current, logoUrl: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-mono"
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-slate-700">Upload logo</span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs text-slate-500" />
          </label>
          <div className="flex items-center justify-between gap-3 md:col-span-2">
            <span className="text-[11px] text-slate-500">
              Official store clicks: {storeSettings.officialStoreClicksCount || 0}
            </span>
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 font-bold text-slate-950 hover:bg-amber-500">
              <Save className="h-4 w-4" />
              Save Store Settings
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Link2 className="mt-0.5 h-5 w-5 text-amber-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-950">Social Media Links</h2>
            <p className="mt-1 text-xs text-slate-500">Choose which platforms appear on the homepage and add custom profiles.</p>
          </div>
        </div>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}
        {saved && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" />Settings saved.</div>}

        <form onSubmit={saveSocialSettings} className="space-y-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SOCIAL_CHANNELS.map(({ channel, label }) => (
              <label key={channel} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={settings.visibleChannels.includes(channel)}
                  onChange={() => toggleChannel(channel)}
                  className="h-4 w-4 accent-amber-500"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {([
              ['whatsappNumber', 'WhatsApp number (with country code)'],
              ['facebookPageUsername', 'Facebook Page username'],
              ['instagramUsername', 'Instagram username'],
              ['tiktokUsername', 'TikTok username'],
              ['twitterUsername', 'X / Twitter username'],
            ] as const).map(([field, label]) => (
              <label key={field} className="space-y-1 text-xs">
                <span className="font-semibold text-slate-700">{label}</span>
                <input
                  value={settings[field]}
                  onChange={(event) => updateSettings({ [field]: event.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono"
                />
              </label>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Custom platforms</h3>
              <p className="text-[11px] text-slate-500">Add YouTube, Pinterest, or any other public social profile.</p>
            </div>
            {settings.customLinks.map((link) => (
              <div key={link.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr_2fr_auto]">
                <label className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 text-[10px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={link.enabled}
                    onChange={(event) => updateSettings({
                      customLinks: settings.customLinks.map((item) => item.id === link.id ? { ...item, enabled: event.target.checked } : item),
                    })}
                    aria-label={`Show ${link.label} link`}
                    className="h-4 w-4 accent-amber-500"
                  />
                  Show
                </label>
                <input
                  value={link.label}
                  maxLength={32}
                  onChange={(event) => updateSettings({
                    customLinks: settings.customLinks.map((item) => item.id === link.id ? { ...item, label: event.target.value } : item),
                  })}
                  aria-label={`${link.label} platform name`}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(event) => updateSettings({
                    customLinks: settings.customLinks.map((item) => item.id === link.id ? { ...item, url: event.target.value } : item),
                  })}
                  aria-label={`${link.label} URL`}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => updateSettings({ customLinks: settings.customLinks.filter((item) => item.id !== link.id) })}
                  aria-label={`Remove ${link.label}`}
                  className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {settings.customLinks.length < 8 && (
              <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-[1fr_2fr_auto]">
                <input
                  value={newLinkLabel}
                  maxLength={32}
                  onChange={(event) => setNewLinkLabel(event.target.value)}
                  placeholder="Platform name, e.g. YouTube"
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs"
                />
                <input
                  type="url"
                  value={newLinkUrl}
                  onChange={(event) => setNewLinkUrl(event.target.value)}
                  placeholder="https://youtube.com/@yourchannel"
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs"
                />
                <button type="button" onClick={addSocialLink} className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                  <Plus className="h-3.5 w-3.5" />
                  Add link
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 disabled:opacity-50">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving…' : 'Save Social Links'}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {SOCIAL_CHANNELS.map(({ channel, label }) => (
            <button
              key={channel}
              type="button"
              onClick={() => window.open(store.getSocialUrl(channel), '_blank', 'noopener,noreferrer')}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              Test {label}
              <ExternalLink className="h-3 w-3" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

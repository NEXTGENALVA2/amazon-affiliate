import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle,
  Copy,
  Download,
  Upload,
  KeyRound,
  Shield,
  Layers,
  Terminal,
} from 'lucide-react';
import { store } from '../../services/store';

export const AdminVercelGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [newUsername, setNewUsername] = useState('admin');
  const [newPassword, setNewPassword] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleUpdateCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setSaveMessage('Please enter both username and password.');
      return;
    }
    store.updateAdminCredentials(newUsername.trim(), newPassword.trim());
    setSaveMessage('Admin credentials updated successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleExportDataBackup = () => {
    const backup = {
      products: store.getProducts(),
      conversations: store.getConversations(),
      exportedAt: new Date().toISOString(),
      app: 'AuraGear Amazon Showcase',
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auragear_store_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Vercel Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black text-white text-xs font-mono font-bold">
          ▲ Vercel Ready
        </div>
        <h2 className="text-xl font-bold text-slate-950">
          How to Connect & Deploy to Vercel
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          This application is pre-configured with a production-ready <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs">vercel.json</code> file, client-side routing, and ultra-fast asset compilation. Follow the quick guide below to deploy to your custom domain on Vercel.
        </p>
      </div>

      {/* 3 Step Deployment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-950 font-bold flex items-center justify-center text-sm">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-900">Push to GitHub</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Initialize Git if you haven't yet and push your codebase to a new repository on your GitHub account.
          </p>
          <div className="bg-slate-900 p-2.5 rounded-xl text-slate-200 font-mono text-[11px] relative group">
            <code>git push origin main</code>
            <button
              onClick={() => handleCopy('git push origin main', 1)}
              className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
            >
              {copiedIndex === 1 ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-950 font-bold flex items-center justify-center text-sm">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-900">Import in Vercel</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-amber-600 underline">vercel.com/new</a>, connect your GitHub account, and select this repository.
          </p>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700 text-[11px] space-y-1">
            <div>• Framework: <strong>Vite</strong></div>
            <div>• Root Directory: <strong>./</strong></div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-950 font-bold flex items-center justify-center text-sm">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-900">Deploy & Enjoy</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Click <strong>Deploy</strong>. Vercel automatically builds using <code className="bg-slate-100 px-1 text-xs">npm run build</code> and serves it on global CDN with instant SSL.
          </p>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>vercel.json rewrite rules pre-configured</span>
          </div>
        </div>
      </div>

      {/* Admin Credentials & Security Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Change Admin Login Credentials</h3>
            <p className="text-xs text-slate-500">Update your secret Admin ID and password</p>
          </div>
        </div>

        <form onSubmit={handleUpdateCreds} className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">New Admin ID</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Update Credentials
            </button>
          </div>
        </form>

        {saveMessage && (
          <p className="text-xs font-semibold text-emerald-600">{saveMessage}</p>
        )}
      </div>

      {/* Backup and Restore Data */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">Storefront Data Backup (JSON)</h3>
          <p className="text-xs text-slate-500">
            Export all products, video reviews, Amazon affiliate tags, and customer chats to a local JSON file.
          </p>
        </div>

        <button
          onClick={handleExportDataBackup}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Store Data</span>
        </button>
      </div>
    </div>
  );
};

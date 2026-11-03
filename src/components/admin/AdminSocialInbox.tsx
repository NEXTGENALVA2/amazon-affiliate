import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Video,
  Send,
  ExternalLink,
  CheckCheck,
  Search,
  Filter,
  Check,
  Archive,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Conversation, SocialChannel, ChatMessage } from '../../types';
import { store } from '../../services/store';

export const AdminSocialInbox: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<SocialChannel | 'all'>('all');
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const loadConversations = () => {
    const list = store.getConversations();
    setConversations(list);
    if (!selectedConvId && list.length > 0) {
      setSelectedConvId(list[0].id);
    }
  };

  useEffect(() => {
    loadConversations();
    const unsub = store.subscribe(loadConversations);
    return unsub;
  }, []);

  const filteredConversations = conversations.filter((c) => {
    const matchesChannel = selectedChannelFilter === 'all' || c.channel === selectedChannelFilter;
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.customerHandle.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const activeConversation = conversations.find((c) => c.id === selectedConvId) || filteredConversations[0];

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConvId(conv.id);
    store.markConversationRead(conv.id);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation) return;

    store.sendAdminReply(activeConversation.id, replyText.trim());
    setReplyText('');
  };

  const handleApplyTemplate = (text: string) => {
    setReplyText(text);
  };

  // Helper to open real external social deep link with prefilled text
  const openExternalSocialReply = (conv: Conversation) => {
    const text = replyText.trim() || `Hello ${conv.customerName}, thanks for reaching out to AuraGear!`;
    const url = store.getSocialUrl(conv.channel, text, conv.customerHandle);
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getChannelIcon = (ch: SocialChannel) => {
    switch (ch) {
      case 'whatsapp':
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-600" />;
      case 'facebook':
        return <Facebook className="w-3.5 h-3.5 text-blue-600" />;
      case 'tiktok':
        return <Video className="w-3.5 h-3.5 text-slate-900" />;
      case 'twitter':
        return <Twitter className="w-3.5 h-3.5 text-sky-600" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Explanation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Unified Social Inbox & Live Customer Chat</h2>
          <p className="text-xs text-slate-500">
            View customer questions and reply directly from this site to WhatsApp, Instagram, Facebook, TikTok, Twitter/X, and Web
          </p>
        </div>

        {/* Channel Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSelectedChannelFilter('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedChannelFilter === 'all' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setSelectedChannelFilter('whatsapp')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedChannelFilter === 'whatsapp' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setSelectedChannelFilter('instagram')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedChannelFilter === 'instagram' ? 'bg-white text-pink-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Instagram
          </button>
          <button
            onClick={() => setSelectedChannelFilter('facebook')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedChannelFilter === 'facebook' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Facebook
          </button>
          <button
            onClick={() => setSelectedChannelFilter('tiktok')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedChannelFilter === 'tiktok' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            TikTok
          </button>
          <button
            onClick={() => setSelectedChannelFilter('twitter')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedChannelFilter === 'twitter' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Twitter / X
          </button>
          <button
            onClick={() => setSelectedChannelFilter('website')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              selectedChannelFilter === 'website' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Website
          </button>
        </div>
      </div>

      {/* Main Inbox Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs min-h-[580px]">
        {/* Left Column: Conversation List */}
        <div className="lg:col-span-5 border-r border-slate-200 flex flex-col">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages, buyers, handles..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No conversations found in this filter.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-50/50 border-l-4 border-amber-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {getChannelIcon(conv.channel)}
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {conv.customerName}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{conv.lastUpdated}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono mb-1 truncate">
                      {conv.customerHandle} · <span className="capitalize">{conv.channel}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {conv.lastMessage}
                    </p>

                    {conv.productTitle && (
                      <div className="mt-1.5 text-[10px] text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded truncate inline-block">
                        Item: {conv.productTitle}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Thread & Reply Box */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {getChannelIcon(activeConversation.channel)}
                    <h3 className="text-sm font-bold text-slate-950">
                      {activeConversation.customerName}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">({activeConversation.customerHandle})</span>
                  </div>
                  {activeConversation.productTitle && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      Customer is asking about: <strong className="text-slate-900">{activeConversation.productTitle}</strong>
                    </p>
                  )}
                </div>

                {/* External Social Opener */}
                {activeConversation.channel !== 'website' && (
                  <button
                    onClick={() => openExternalSocialReply(activeConversation)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    title={`Open reply in ${activeConversation.channel}`}
                  >
                    <span>Launch in {activeConversation.channel.toUpperCase()}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Message History Bubble Area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[380px] bg-slate-50/30">
                {activeConversation.messages.map((m) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 px-1">
                        <span>{isAdmin ? 'You (AuraGear Admin)' : activeConversation.customerName}</span>
                        <span>·</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isAdmin
                            ? 'bg-slate-950 text-white rounded-tr-xs'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reply Templates */}
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                  Quick Replies:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyTemplate('Yes! This Amazon deal is verified live right now with Prime delivery.')
                  }
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 whitespace-nowrap text-[11px] cursor-pointer"
                >
                  "Deal is live & Prime eligible"
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyTemplate(
                      'The official link takes you straight to the brand flagship store on Amazon with full warranty!'
                    )
                  }
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 whitespace-nowrap text-[11px] cursor-pointer"
                >
                  "Official Flagship Warranty"
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyTemplate(
                      'Thanks for reaching out! Let me know if you need help picking between models.'
                    )
                  }
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 whitespace-nowrap text-[11px] cursor-pointer"
                >
                  "General Greeting"
                </button>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-white space-y-3">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Type reply to ${activeConversation.customerName} directly on site...`}
                  className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Replying as: <strong className="text-slate-900">Admin Support</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeConversation.channel !== 'website' && (
                      <button
                        type="button"
                        onClick={() => openExternalSocialReply(activeConversation)}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        Send via {activeConversation.channel} App
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      <span>Send Direct Reply</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Select a conversation to reply
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

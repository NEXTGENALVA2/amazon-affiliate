import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  ExternalLink,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Video,
  CheckCheck,
  Minimize2,
} from 'lucide-react';
import { Product, SocialChannel, ChatMessage } from '../types';
import { store } from '../services/store';

interface ChatWidgetProps {
  initialProduct?: Product | null;
  onClearInitialProduct?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  initialProduct,
  onClearInitialProduct,
  isOpen,
  onToggle,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<SocialChannel>('website');
  const [messageText, setMessageText] = useState('');
  const [visitorName, setVisitorName] = useState('Visitor');
  const [visitorContact, setVisitorContact] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load website chat history for this session
  useEffect(() => {
    const updateChat = () => {
      const convs = store.getConversations();
      // Look for web chat or current visitor's channel
      const webConv = convs.find((c) => c.channel === 'website');
      if (webConv) {
        setChatHistory(webConv.messages);
      }
    };

    updateChat();
    const unsub = store.subscribe(updateChat);
    return unsub;
  }, []);

  useEffect(() => {
    if (initialProduct && isOpen) {
      setMessageText(`Hi! I'm interested in the "${initialProduct.title}". Is this current Amazon deal still valid with Prime delivery?`);
    }
  }, [initialProduct, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const contact = visitorContact.trim() || 'Website Visitor';
    store.sendCustomerMessage(
      selectedChannel,
      visitorName.trim() || 'Guest Visitor',
      contact,
      messageText.trim(),
      initialProduct?.id,
      initialProduct?.title
    );

    setMessageText('');
    if (onClearInitialProduct) onClearInitialProduct();
  };

  // Direct Social URL Openers
  const openSocialChannel = (channel: SocialChannel) => {
    const inquiry = initialProduct
      ? `Hi AuraGear! Inquiring about ${initialProduct.title} on Amazon.`
      : 'Hi AuraGear! I have a question about your curated tech gear on Amazon.';

    const url = store.getSocialUrl(channel, inquiry);

    // Also record conversation in store so admin sees it in the unified inbox!
    store.sendCustomerMessage(
      channel,
      visitorName || 'Social Shopper',
      channel === 'whatsapp' ? '+1 (Customer WhatsApp)' : `@shopper_${channel}`,
      inquiry,
      initialProduct?.id,
      initialProduct?.title
    );

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shopName = store.getStoreSettings().shopName || 'Kefayaan';

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end max-w-[calc(100vw-1.5rem)]">
      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-[calc(100vw-1.5rem)] sm:w-96 max-h-[82vh] h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-slate-950 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold leading-tight">{shopName} Live Help</h4>
                <p className="text-[10px] text-slate-400">Admin replies live or via Socials</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Social Channels Selector Bar */}
          <div className="bg-slate-50 border-b border-slate-200 p-2 shrink-0">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1 mb-1.5">
              Choose Reply Channel:
            </div>
            <div className="grid grid-cols-6 gap-1">
              <button
                onClick={() => setSelectedChannel('website')}
                title="Chat directly on website"
                className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                  selectedChannel === 'website'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-[9px] mt-0.5">Site</span>
              </button>

              <button
                onClick={() => openSocialChannel('whatsapp')}
                title="Connect on WhatsApp"
                className="flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[9px] mt-0.5">WA</span>
              </button>

              <button
                onClick={() => openSocialChannel('instagram')}
                title="Message on Instagram"
                className="flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-medium bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span className="text-[9px] mt-0.5">Insta</span>
              </button>

              <button
                onClick={() => openSocialChannel('facebook')}
                title="Connect on Messenger"
                className="flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[9px] mt-0.5">FB</span>
              </button>

              <button
                onClick={() => openSocialChannel('tiktok')}
                title="Message on TikTok"
                className="flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                <Video className="w-3.5 h-3.5 text-slate-900" />
                <span className="text-[9px] mt-0.5">TikTok</span>
              </button>

              <button
                onClick={() => openSocialChannel('twitter')}
                title="Message on Twitter / X"
                className="flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
              >
                <Twitter className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-[9px] mt-0.5">X</span>
              </button>
            </div>
          </div>

          {/* Conversation Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Have a question about a product or Amazon link?</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Send a message below or choose WhatsApp / Instagram for instant direct response from our staff.
                </p>
              </div>
            ) : (
              chatHistory.map((msg) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                      {isAdmin ? `${shopName} Specialist` : 'You'}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        isAdmin
                          ? 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs'
                          : 'bg-amber-400 text-slate-950 font-medium rounded-tr-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask anything or request Amazon deal link..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="p-2 bg-slate-950 text-white rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Admin replies sync to dashboard</span>
              <span className="text-emerald-600 font-semibold">Active Support</span>
            </div>
          </form>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer group"
        aria-label="Open customer support and social chat"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
        </div>
        <span className="text-xs font-bold tracking-wide">Live Chat & WhatsApp</span>
      </button>
    </div>
  );
};

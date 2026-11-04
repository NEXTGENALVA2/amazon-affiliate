import React from 'react';
import { ExternalLink } from 'lucide-react';

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'pinterest' | 'whatsapp' | 'generic';

export function getSocialPlatform(id: string, label: string, url: string): SocialPlatform {
  const identity = `${id} ${label} ${url}`.toLowerCase();
  if (identity.includes('whatsapp') || identity.includes('wa.me')) return 'whatsapp';
  if (identity.includes('instagram')) return 'instagram';
  if (identity.includes('facebook') || identity.includes('messenger') || identity.includes('fb.com')) return 'facebook';
  if (identity.includes('tiktok')) return 'tiktok';
  if (identity.includes('youtube') || identity.includes('youtu.be')) return 'youtube';
  if (identity.includes('pinterest') || identity.includes('pin.it')) return 'pinterest';
  if (identity.includes('twitter') || identity.includes('x.com')) return 'twitter';
  return 'generic';
}

const platformColors: Record<SocialPlatform, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  tiktok: '#111827',
  youtube: '#FF0033',
  twitter: '#111827',
  pinterest: '#E60023',
  whatsapp: '#25D366',
  generic: '#64748B',
};

export const SocialPlatformIcon: React.FC<{ platform: SocialPlatform; className?: string }> = ({
  platform,
  className = 'h-5 w-5',
}) => {
  if (platform === 'generic') return <ExternalLink aria-hidden="true" className={className} />;

  const commonProps = {
    'aria-hidden': true as const,
    className,
    fill: 'none',
    viewBox: '0 0 24 24',
    style: { color: platformColors[platform] },
  };

  switch (platform) {
    case 'facebook':
      return (
        <svg {...commonProps} viewBox="0 0 24 24">
          <path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4Z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...commonProps} viewBox="0 0 24 24">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="17.7" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...commonProps} viewBox="0 0 24 24">
          <path fill="currentColor" d="M15.7 3h-3.2v12.1a2.7 2.7 0 1 1-2.3-2.7v-3.3a6 6 0 1 0 5.5 6V9a8 8 0 0 0 4.3 1.3V7.1A4.8 4.8 0 0 1 15.7 3Z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...commonProps} viewBox="0 0 24 24">
          <path fill="currentColor" d="M23 7.1a3 3 0 0 0-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.5A3 3 0 0 0 1 7.1 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.9A3 3 0 0 0 3.1 19c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.9 31 31 0 0 0-.5-4.9Z" />
          <path fill="white" d="m9.7 15.5 5.8-3.5-5.8-3.5v7Z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg {...commonProps} viewBox="0 0 24 24">
          <path fill="currentColor" d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.8 5.7 22H2.5l7.3-8.4L1.8 2h6.4l4.4 6.6L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg {...commonProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path fill="white" d="M12.6 5.2c-4.1 0-6.2 2.9-6.2 5.3 0 1.5.6 2.9 1.9 3.4.2.1.4 0 .5-.3l.2-.8c.1-.3 0-.4-.2-.7-.4-.5-.7-1.1-.7-2 0-2.5 1.9-4.7 4.9-4.7 2.7 0 4.2 1.6 4.2 3.8 0 2.9-1.3 5.4-3.3 5.4-1.1 0-1.9-.9-1.6-2l.7-2.9c.4-1.5-.1-2.7-1.4-2.7-1.1 0-2 1.1-2 2.6 0 .9.3 1.5.3 1.5l-1.3 5.5c-.4 1.6-.1 3.5 0 3.7.1.1.2.1.3 0 .1-.2 1.4-1.7 1.8-3.3l.7-2.6c.4.8 1.5 1.5 2.7 1.5 3.5 0 5.8-3.2 5.8-7.5 0-3.2-2.7-6.2-7.3-6.2Z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...commonProps} viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2a9.8 9.8 0 0 0-8.4 14.8L2.3 22l5.4-1.4A10 10 0 1 0 12 2Zm0 17.9a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 19.9Z" />
          <path fill="currentColor" d="M16.4 13.7c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8.9-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.3.1-.4l.4-.4c.1-.1.2-.3.3-.4 0-.2 0-.3 0-.4s-.5-1.2-.7-1.6c-.2-.4-.4-.4-.5-.4H8.9c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.1.9 2.3.1.2 1.6 2.5 3.9 3.5.5.2.9.4 1.2.4.5.2 1 .1 1.4.1.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
        </svg>
      );
  }
};

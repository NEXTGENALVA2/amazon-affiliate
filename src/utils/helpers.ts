/**
 * Utility to extract YouTube embed URL from various YouTube link formats
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Handles:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  // https://www.youtube.com/shorts/VIDEO_ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? `https://www.youtube-nocookie.com/embed/${match[2]}` : null;
}

/**
 * Format currency with tabular precision
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Clean relative date formatting
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

/**
 * Ensure Amazon URL has clean affiliate tag attached
 */
export function formatAmazonAffiliateUrl(url: string, defaultTag = 'auragear-20'): string {
  if (!url) return 'https://www.amazon.com';
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.get('tag')) {
      parsed.searchParams.set('tag', defaultTag);
    }
    return parsed.toString();
  } catch {
    if (url.includes('?')) {
      return `${url}&tag=${defaultTag}`;
    }
    return `${url}?tag=${defaultTag}`;
  }
}

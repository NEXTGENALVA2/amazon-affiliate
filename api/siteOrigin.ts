import { IncomingMessage } from 'node:http';

export const getSiteOrigin = (request: IncomingMessage): string => {
  const configuredUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VITE_SITE_URL;
  const forwardedHost = request.headers['x-forwarded-host'];
  const requestHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || request.headers.host;

  if (configuredUrl) {
    const url = new URL(configuredUrl.includes('://') ? configuredUrl : `https://${configuredUrl}`);
    if (!['http:', 'https:'].includes(url.protocol) || !/^[a-z0-9.-]+(?::\d+)?$/i.test(url.host)) {
      throw new Error('Configured site URL is invalid.');
    }
    return url.origin;
  }

  if (!requestHost || !/^[a-z0-9.-]+(?::\d+)?$/i.test(requestHost)) {
    throw new Error('Unable to determine a valid public site host.');
  }

  const forwardedProtocol = request.headers['x-forwarded-proto'];
  const protocol = Array.isArray(forwardedProtocol) ? forwardedProtocol[0] : forwardedProtocol || 'https';
  if (!['http', 'https'].includes(protocol.split(',')[0].trim())) {
    throw new Error('Unable to determine a valid public site protocol.');
  }
  return `${protocol.split(',')[0].trim()}://${requestHost}`;
};

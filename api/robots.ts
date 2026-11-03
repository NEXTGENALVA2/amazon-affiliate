import { IncomingMessage, ServerResponse } from 'node:http';
import { getSiteOrigin } from './siteOrigin';

export default function handler(request: IncomingMessage, response: ServerResponse) {
  try {
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    response.statusCode = 200;
    response.end(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${getSiteOrigin(request)}/sitemap.xml\n`);
  } catch (error) {
    console.error('Robots file generation failed', error);
    response.statusCode = 500;
    response.end('Robots file generation failed');
  }
}

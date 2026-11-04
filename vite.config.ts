import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import adminAuthApi from './api/admin-auth.js';
import siteSettingsApi from './api/site-settings.js';
import { AdminApiError, sendAdminJson } from './server/admin-auth.js';
import type { AdminRequest } from './server/admin-auth.js';

const serverEnvironmentKeys = [
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'ADMIN_SESSION_SECRET',
  'CHAT_ADMIN_USERNAME',
  'CHAT_ADMIN_PASSWORD',
  'CHAT_SESSION_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_SUPABASE_URL',
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of serverEnvironmentKeys) {
    if (!process.env[key] && env[key]) process.env[key] = env[key];
  }

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'local-api-functions',
        configureServer(server) {
          server.middlewares.use(async (
            request: IncomingMessage,
            response: ServerResponse,
            next: (error?: Error) => void
          ) => {
            const pathname = new URL(request.url || '/', 'http://localhost').pathname;
            const handler = pathname === '/api/admin-auth'
              ? adminAuthApi
              : pathname === '/api/site-settings'
                ? siteSettingsApi
                : null;
            if (!handler) {
              next();
              return;
            }

            try {
              const chunks: Buffer[] = [];
              let size = 0;
              for await (const chunk of request) {
                const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                size += buffer.length;
                if (size > 2 * 1024 * 1024) {
                  sendAdminJson(response, 413, { error: 'Request body is too large.' });
                  return;
                }
                chunks.push(buffer);
              }
              (request as AdminRequest).body = Buffer.concat(chunks).toString('utf8');
              await handler(request as AdminRequest, response);
            } catch (error) {
              if (response.headersSent || response.writableEnded) return;
              if (error instanceof AdminApiError) {
                sendAdminJson(response, error.status, { error: error.message });
                return;
              }
              next(error instanceof Error ? error : new Error(String(error)));
            }
          });
        },
      },
    ],
  };
});

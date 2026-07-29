import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import express from 'express';
import { AccessTradeProvider } from './src/providers/AccessTradeProvider';

dotenv.config();

function expressApiPlugin(): Plugin {
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/affiliate/generate-batch', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          try {
            const body = bodyStr ? JSON.parse(bodyStr) : {};
            const urls = body.urls;

            if (!Array.isArray(urls) || urls.length === 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Array of urls is required' }));
              return;
            }

            const provider = new AccessTradeProvider();
            if (!provider.isConfigured()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Please configure AccessTrade credentials' }));
              return;
            }

            const results = await provider.convertBatch(urls, body.sub_id || body.subId || 'batch');

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              data: results,
            }));
          } catch (error: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: error.message || 'Please configure AccessTrade credentials',
            }));
          }
        });
      });

      server.middlewares.use('/api/affiliate/generate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          try {
            const body = bodyStr ? JSON.parse(bodyStr) : {};
            const targetUrl = body.original_url || body.originalUrl;

            if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Valid original_url is required' }));
              return;
            }

            const provider = new AccessTradeProvider();
            if (!provider.isConfigured()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Please configure AccessTrade credentials' }));
              return;
            }

            const result = await provider.convert({
              url: targetUrl.trim(),
              subId: body.sub_id || body.subId || 'default',
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              data: result,
              affiliate_url: result.affiliateUrl,
              short_url: result.shortUrl,
            }));
          } catch (error: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: error.message || 'Please configure AccessTrade credentials',
            }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), expressApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

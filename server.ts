import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AccessTradeProvider } from './src/providers/AccessTradeProvider';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Endpoint: POST /api/affiliate/generate
app.post('/api/affiliate/generate', async (req: Request, res: Response) => {
  try {
    const { original_url, originalUrl, sub_id, subId } = req.body;
    const targetUrl = original_url || originalUrl;

    if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.trim()) {
      return res.status(400).json({ error: 'Valid original_url is required' });
    }

    const provider = new AccessTradeProvider();
    if (!provider.isConfigured()) {
      return res.status(400).json({ error: 'Please configure AccessTrade credentials' });
    }

    const result = await provider.convert({
      url: targetUrl.trim(),
      subId: sub_id || subId || 'default',
    });

    return res.json({
      success: true,
      data: result,
      affiliate_url: result.affiliateUrl,
      short_url: result.shortUrl,
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message || 'Please configure AccessTrade credentials',
    });
  }
});

// API Endpoint: POST /api/affiliate/generate-batch
app.post('/api/affiliate/generate-batch', async (req: Request, res: Response) => {
  try {
    const { urls, sub_id, subId } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Array of urls is required' });
    }

    const provider = new AccessTradeProvider();
    if (!provider.isConfigured()) {
      return res.status(400).json({ error: 'Please configure AccessTrade credentials' });
    }

    const results = await provider.convertBatch(urls, sub_id || subId || 'batch');

    return res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message || 'Please configure AccessTrade credentials',
    });
  }
});

// Serve production static assets if dist exists
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req: Request, res: Response) => {
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(distIndex, (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`AccessTrade Affiliate Server running on http://localhost:${PORT}`);
});

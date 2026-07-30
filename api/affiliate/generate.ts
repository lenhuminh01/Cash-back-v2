import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AccessTradeProvider } from '../../src/providers/AccessTradeProvider';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { original_url, originalUrl, sub_id, subId } = req.body || {};
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

    return res.status(200).json({
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
}

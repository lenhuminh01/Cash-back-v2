import { PlatformType } from '../types';
import { AffiliateProvider, ConvertOptions, ConvertResult } from './AffiliateProvider';

export class AccessTradeProvider implements AffiliateProvider {
  name = 'AccessTrade';

  private apiKey: string;
  private campaignMap: Record<PlatformType, string>;

  constructor(apiKey?: string) {
    this.apiKey = (apiKey || process.env.ACCESS_TRADE_API_KEY || '').trim();

    const defaultShopee = (process.env.ACCESS_TRADE_CAMPAIGN_SHOPEE || '4751584435713464237').trim();
    const defaultTikTok = (process.env.ACCESS_TRADE_CAMPAIGN_TIKTOK || '6648523843406889655').trim();
    const defaultLazada = (process.env.ACCESS_TRADE_CAMPAIGN_LAZADA || '5087153089503673507').trim();
    const fallbackCampaign = (process.env.ACCESS_TRADE_CAMPAIGN_ID || '').trim();

    this.campaignMap = {
      shopee: defaultShopee || fallbackCampaign,
      tiktok: defaultTikTok || fallbackCampaign,
      lazada: defaultLazada || fallbackCampaign,
      unknown: fallbackCampaign || defaultShopee,
    };
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  private detectPlatform(url: string): PlatformType {
    const clean = url.toLowerCase();
    if (clean.includes('shopee.') || clean.includes('shope.ee')) return 'shopee';
    if (clean.includes('tiktok.com') || clean.includes('vt.tiktok.com')) return 'tiktok';
    if (clean.includes('lazada.') || clean.includes('s.lazada.co')) return 'lazada';
    return 'unknown';
  }

  private extractTitle(url: string): string {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const parts = parsed.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1] || '';
      if (last && !last.match(/^(i\d+|\d+)$/i)) {
        const title = last
          .replace(/\.html$/i, '')
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        if (title.length > 5) return title.length > 50 ? title.slice(0, 47) + '...' : title;
      }
    } catch {
      // ignore
    }
    return 'Product Link';
  }

  public getCampaignId(platform: PlatformType): string {
    return this.campaignMap[platform] || this.campaignMap.unknown || '';
  }

  public async convert(options: ConvertOptions): Promise<ConvertResult> {
    if (!this.apiKey) {
      throw new Error('Missing AccessTrade configuration: ACCESS_TRADE_API_KEY is not set in server .env file.');
    }

    const { url, subId = 'default' } = options;
    const platform = this.detectPlatform(url);
    const campaignId = this.getCampaignId(platform);
    const platformName = platform === 'shopee' ? 'Shopee' : platform === 'tiktok' ? 'TikTok Shop' : platform === 'lazada' ? 'Lazada' : 'E-Commerce';

    if (!campaignId) {
      throw new Error(`Missing AccessTrade configuration: No campaign ID configured for ${platformName}.`);
    }

    const title = this.extractTitle(url);
    const hashId = Math.random().toString(36).slice(2, 8);

    let response: Response;
    try {
      response = await fetch('https://api.accesstrade.vn/v1/product_link/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${this.apiKey}`,
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          urls: [url],
          utm_source: 'cashback_link',
          sub1: subId,
        }),
      });
    } catch (networkErr: any) {
      throw new Error(`URL conversion failed: Unable to connect to AccessTrade API server (${networkErr.message || 'Network error'})`);
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid API Key: AccessTrade rejected the Authorization token. Please verify ACCESS_TRADE_API_KEY.');
    }

    const data = await response.json();

    if (!response.ok || (data && data.status === false)) {
      const msg = typeof data?.message === 'object' ? JSON.stringify(data.message) : data?.message || '';
      if (msg.includes('Campaign does not exists') || msg.includes('not running') || data?.status_code === '03') {
        throw new Error(`AccessTrade Permission Issue: Campaign ID ${campaignId} (${platformName}) is not active or your AccessTrade account has not registered/joined this campaign.`);
      }
      throw new Error(`AccessTrade API Error: ${msg || 'URL conversion failed'}`);
    }

    let affiliateUrl = '';
    let shortUrl = '';

    // Handle v1 result array format
    if (Array.isArray(data.result) && data.result.length > 0) {
      const item = data.result[0];
      affiliateUrl = item.link || item.short_link || item.aff_link || '';
      shortUrl = item.short_link || item.link || item.aff_link || '';
    }
    
    // Handle data.success_link format (as returned by product_link/create API for active campaigns)
    if (!affiliateUrl && data.data && Array.isArray(data.data.success_link) && data.data.success_link.length > 0) {
      const item = data.data.success_link[0];
      affiliateUrl = item.aff_link || item.short_link || '';
      shortUrl = item.short_link || item.aff_link || '';
    }

    if (!affiliateUrl) {
      if (data.data && Array.isArray(data.data.error_link) && data.data.error_link.length > 0) {
        const errorItem = data.data.error_link[0];
        throw new Error(`AccessTrade API Error (${platformName}): ${errorItem?.message || 'The link is not part of the campaign'}`);
      }
      throw new Error(`URL conversion failed: AccessTrade API did not return a valid tracking URL for ${platformName}.`);
    }

    return {
      id: `at_${Date.now()}_${hashId}`,
      originalUrl: url,
      affiliateUrl,
      shortUrl,
      platform,
      subId,
      createdAt: new Date().toISOString(),
      title,
    };
  }

  public async convertBatch(urls: string[], subId: string = 'batch'): Promise<ConvertResult[]> {
    if (!this.apiKey) {
      throw new Error('Missing AccessTrade configuration: ACCESS_TRADE_API_KEY is not set.');
    }

    const results: ConvertResult[] = [];
    for (const u of urls) {
      const res = await this.convert({ url: u, subId });
      results.push(res);
    }
    return results;
  }
}

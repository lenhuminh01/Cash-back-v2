import { PlatformType } from '../types';

export interface ConvertOptions {
  url: string;
  subId?: string;
}

export interface ConvertResult {
  id: string;
  originalUrl: string;
  affiliateUrl: string;
  shortUrl: string;
  platform: PlatformType;
  subId: string;
  createdAt: string;
  title?: string;
}

export interface AffiliateProvider {
  name: string;
  isConfigured(): boolean;
  convert(options: ConvertOptions): Promise<ConvertResult>;
  convertBatch(urls: string[], subId?: string): Promise<ConvertResult[]>;
}

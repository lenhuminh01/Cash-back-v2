export type PlatformType = 'shopee' | 'tiktok' | 'lazada' | 'unknown';

export interface ConvertedLink {
  id: string;
  originalUrl: string;
  normalizedUrl: string;
  affiliateUrl: string;
  shortUrl: string;
  platform: PlatformType;
  subId: string;
  createdAt: string;
  title?: string;
}

export interface PlatformConfig {
  id: PlatformType;
  name: string;
  domains: string[];
  color: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  borderLight: string;
  borderDark: string;
  sampleUrl: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

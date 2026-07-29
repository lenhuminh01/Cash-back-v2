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
  estimatedCashback?: number;
  commissionRate?: number;
  status?: 'pending' | 'approved' | 'rejected';
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

export interface UserWallet {
  deviceId: string;
  pendingBalance: number;
  availableBalance: number;
  totalEarned: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface PayoutRequest {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

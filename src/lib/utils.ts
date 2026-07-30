import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PlatformType, ConvertedLink, PlatformConfig, UserWallet, PayoutRequest } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PLATFORMS: Record<PlatformType, PlatformConfig> = {
  shopee: {
    id: 'shopee',
    name: 'Shopee',
    domains: ['shopee.', 'shope.ee', 's.shopee.vn'],
    color: '#EE4D2D',
    bgLight: 'bg-orange-50 hover:bg-orange-100',
    bgDark: 'dark:bg-orange-950/30 dark:hover:bg-orange-950/50',
    textLight: 'text-orange-600',
    textDark: 'dark:text-orange-400',
    borderLight: 'border-orange-200',
    borderDark: 'dark:border-orange-800/40',
    sampleUrl: 'https://s.shopee.vn/7fYcRtF8Fd',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok Shop',
    domains: ['tiktok.com', 'vt.tiktok.com', 'shop.tiktok.com', 'vm.tiktok.com'],
    color: '#00F2FE',
    bgLight: 'bg-teal-50 hover:bg-teal-100',
    bgDark: 'dark:bg-teal-950/30 dark:hover:bg-teal-950/50',
    textLight: 'text-teal-700',
    textDark: 'dark:text-teal-300',
    borderLight: 'border-teal-200',
    borderDark: 'dark:border-teal-800/40',
    sampleUrl: 'https://vt.tiktok.com/ZSrP9x2K/?_t=8x9lK2&enter_from=share',
  },
  lazada: {
    id: 'lazada',
    name: 'Lazada',
    domains: ['lazada.', 's.lazada.co'],
    color: '#0F146D',
    bgLight: 'bg-indigo-50 hover:bg-indigo-100',
    bgDark: 'dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50',
    textLight: 'text-indigo-700',
    textDark: 'dark:text-indigo-300',
    borderLight: 'border-indigo-200',
    borderDark: 'dark:border-indigo-800/40',
    sampleUrl: 'https://www.lazada.vn/products/audio-wireless-earbuds-i10928374.html?spm=a2o4n&exlaz=test',
  },
  unknown: {
    id: 'unknown',
    name: 'Short Link',
    domains: [],
    color: '#6B7280',
    bgLight: 'bg-gray-50',
    bgDark: 'dark:bg-gray-900',
    textLight: 'text-gray-600',
    textDark: 'dark:text-gray-400',
    borderLight: 'border-gray-200',
    borderDark: 'dark:border-gray-800',
    sampleUrl: '',
  },
};

export function detectPlatform(url: string): PlatformType {
  if (!url || typeof url !== 'string') return 'unknown';
  const cleanUrl = url.trim().toLowerCase();

  if (cleanUrl.includes('shopee.') || cleanUrl.includes('shope.ee') || cleanUrl.includes('s.shopee.vn')) {
    return 'shopee';
  }
  if (
    cleanUrl.includes('tiktok.com') ||
    cleanUrl.includes('vt.tiktok.com') ||
    cleanUrl.includes('shop.tiktok.com') ||
    cleanUrl.includes('vm.tiktok.com')
  ) {
    return 'tiktok';
  }
  if (cleanUrl.includes('lazada.') || cleanUrl.includes('s.lazada.co')) {
    return 'lazada';
  }

  return 'unknown';
}

export function isValidUrl(urlStr: string): boolean {
  try {
    const formatted = urlStr.trim().startsWith('http') ? urlStr.trim() : `https://${urlStr.trim()}`;
    const parsed = new URL(formatted);
    return parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string, platform: PlatformType): string {
  let cleanInput = url.trim();
  if (!cleanInput.startsWith('http://') && !cleanInput.startsWith('https://')) {
    cleanInput = `https://${cleanInput}`;
  }

  try {
    const parsed = new URL(cleanInput);

    if (platform === 'shopee') {
      const allowedParams = new Set(['shopid', 'itemid']);
      const searchParams = new URLSearchParams();
      parsed.searchParams.forEach((val, key) => {
        if (allowedParams.has(key.toLowerCase())) {
          searchParams.append(key, val);
        }
      });
      parsed.search = searchParams.toString();
      return parsed.toString();
    }

    if (platform === 'tiktok' || platform === 'lazada') {
      parsed.search = '';
      return parsed.toString();
    }

    parsed.search = '';
    return parsed.toString();
  } catch {
    return cleanInput;
  }
}

export function extractTitle(url: string): string {
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
  return 'Sản phẩm mua sắm';
}

export function generateHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash).toString(36);
  return (positive + 'x9k2m7q').slice(0, 6);
}

export const MERCHANT_COMMISSION_CAP = 50000;
export const MAX_USER_CASHBACK_CAP = 27000;

export function calculateEstimatedCashback(platform: PlatformType, itemPrice: number = 250000): { rate: number; cashback: number } {
  let rate = 2.2;
  if (platform === 'shopee') rate = 2.5;
  if (platform === 'tiktok') rate = 2.2;
  if (platform === 'lazada') rate = 2.0;

  const grossCommissionRaw = itemPrice * (rate / 100);
  const grossCommission = Math.min(grossCommissionRaw, MERCHANT_COMMISSION_CAP);
  const netCommission = grossCommission * 0.9;
  const rawUserShare = netCommission * 0.6;
  const userCashback = Math.min(rawUserShare, MAX_USER_CASHBACK_CAP);
  const cashback = Math.max(1000, Math.round(userCashback / 500) * 500);

  return { rate, cashback };
}

export function getOrCreateDeviceId(): string {
  const key = 'cashback_device_id_v2';
  let deviceId = localStorage.getItem(key);
  if (!deviceId) {
    deviceId = `dev_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, deviceId);
  }
  return deviceId;
}

export async function requestAccessTradeConversion(originalUrl: string, subId?: string): Promise<ConvertedLink> {
  const activeSubId = subId || getOrCreateDeviceId();
  const platform = detectPlatform(originalUrl);
  const { rate, cashback } = calculateEstimatedCashback(platform);
  const normalized = normalizeUrl(originalUrl, platform);

  try {
    const response = await fetch('/api/affiliate/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_url: originalUrl,
        sub_id: activeSubId,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success && data.data) {
      const serverResult = data.data;
      const realShort = serverResult.shortUrl || serverResult.short_url || serverResult.affiliateUrl || serverResult.affiliate_url;
      const realAff = serverResult.affiliateUrl || serverResult.affiliate_url || serverResult.shortUrl || serverResult.short_url;

      if (realShort && (realShort.startsWith('http://') || realShort.startsWith('https://'))) {
        return {
          id: serverResult.id || `at_${Date.now()}`,
          originalUrl,
          normalizedUrl: normalized,
          affiliateUrl: realAff || normalized,
          shortUrl: realShort || normalized,
          platform,
          subId: activeSubId,
          createdAt: new Date().toISOString(),
          title: serverResult.title || extractTitle(originalUrl),
          estimatedCashback: cashback,
          commissionRate: rate,
          status: 'pending',
        };
      }
    }
  } catch {
    // Fallback if offline
  }

  return createCleanShortLink(originalUrl, activeSubId);
}

export function createCleanShortLink(originalUrl: string, subId?: string): ConvertedLink {
  const platform = detectPlatform(originalUrl);
  const normalizedUrl = normalizeUrl(originalUrl, platform);
  const hash = generateHash(originalUrl + Date.now().toString());
  const title = extractTitle(originalUrl);
  const { rate, cashback } = calculateEstimatedCashback(platform);
  const activeSubId = subId || getOrCreateDeviceId();

  return {
    id: `link_${Date.now()}_${hash}`,
    originalUrl,
    normalizedUrl,
    affiliateUrl: normalizedUrl,
    shortUrl: normalizedUrl,
    platform,
    subId: activeSubId,
    createdAt: new Date().toISOString(),
    title,
    estimatedCashback: cashback,
    commissionRate: rate,
    status: 'pending',
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch {
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const BEST_SELLERS = [
  {
    platform: 'shopee' as PlatformType,
    label: '🔥 SRM CeraVe',
    url: 'https://s.shopee.vn/7fYcRtF8Fd',
  },
  {
    platform: 'shopee' as PlatformType,
    label: '✨ Tẩy trang L\'oreal',
    url: 'https://s.shopee.vn/4fv0sPBEv5',
  },
];

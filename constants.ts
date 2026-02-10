import { PlatformId, BoostType, PlatformConfig } from './types';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Video,
} from 'lucide-react';

export const PLATFORMS: PlatformConfig[] = [
  {
    id: PlatformId.TIKTOK,
    name: 'TikTok',
    icon: Video,
    color: '#000000',
    gradient: 'from-pink-500 to-cyan-500',
    allowedBoosts: [BoostType.LIKES, BoostType.FOLLOWERS, BoostType.VIEWS, BoostType.FAVOURITES, BoostType.COMMENTS],
  },
  {
    id: PlatformId.YOUTUBE,
    name: 'YouTube',
    icon: Youtube,
    color: '#FF0000',
    gradient: 'from-red-600 to-red-400',
    allowedBoosts: [BoostType.LIKES, BoostType.VIEWS, BoostType.SUBSCRIBERS],
  },
  {
    id: PlatformId.INSTAGRAM,
    name: 'Instagram',
    icon: Instagram,
    color: '#E1306C',
    gradient: 'from-purple-500 via-pink-500 to-orange-500',
    allowedBoosts: [BoostType.LIKES, BoostType.FOLLOWERS, BoostType.VIEWS],
  },
  {
    id: PlatformId.FACEBOOK,
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    gradient: 'from-blue-600 to-blue-400',
    allowedBoosts: [BoostType.LIKES, BoostType.FOLLOWERS, BoostType.VIEWS],
  },
];

export const QUANTITY_OPTIONS: Record<PlatformId, Partial<Record<BoostType, string[]>>> = {
  [PlatformId.TIKTOK]: {
    [BoostType.LIKES]: ['1k', '2k', '3k', '4k', '5k', '10k', '50k', '100k'],
    [BoostType.FOLLOWERS]: ['100', '500', '1k', '2k', '3k', '4k', '5k', '10k'],
    [BoostType.VIEWS]: ['1k', '2k', '3k', '4k', '5k', '10k', '50k', '100k'],
    [BoostType.FAVOURITES]: ['100', '200', '300', '400', '500'],
    [BoostType.COMMENTS]: ['10', '20', '30', '40', '50', '100'],
  },
  [PlatformId.FACEBOOK]: {
    [BoostType.LIKES]: ['1k', '2k', '3k', '4k', '5k'],
    [BoostType.FOLLOWERS]: ['1k', '2k', '3k', '4k', '5k'],
    [BoostType.VIEWS]: ['10k', '20k', '30k', '40k', '50k'],
  },
  [PlatformId.YOUTUBE]: {
    [BoostType.LIKES]: ['1k', '2k', '3k', '4k', '5k'],
    [BoostType.VIEWS]: ['1k', '2k', '3k', '4k', '5k'],
    [BoostType.SUBSCRIBERS]: ['1k', '2k', '3k', '4k', '5k', '10k'],
  },
  [PlatformId.INSTAGRAM]: {
    [BoostType.LIKES]: ['1k', '2k', '3k', '4k', '5k'],
    [BoostType.FOLLOWERS]: ['1k', '2k', '3k', '4k', '5k'],
    [BoostType.VIEWS]: ['10k', '20k', '30k', '40k', '50k'],
  },
};

const PRICE_LIST: Record<PlatformId, Partial<Record<BoostType, Record<string, number>>>> = {
  [PlatformId.TIKTOK]: {
    [BoostType.LIKES]: { '1k': 150, '2k': 280, '3k': 430, '4k': 580, '5k': 730, '10k': 1480, '50k': 7480, '100k': 14980 },
    [BoostType.FOLLOWERS]: { '100': 90, '500': 450, '1k': 900, '2k': 1700, '3k': 2600, '4k': 3500, '5k': 4400, '10k': 8900 },
    [BoostType.VIEWS]: { '1k': 80, '2k': 160, '3k': 240, '4k': 320, '5k': 400, '10k': 700, '50k': 3900, '100k': 7900 },
    [BoostType.FAVOURITES]: { '100': 170, '200': 340, '300': 510, '400': 680, '500': 850 },
    [BoostType.COMMENTS]: { '10': 30, '20': 60, '30': 90, '40': 120, '50': 150, '100': 300 },
  },
  [PlatformId.FACEBOOK]: {
    [BoostType.LIKES]: { '1k': 850, '2k': 1700, '3k': 2550, '4k': 3400, '5k': 4250 },
    [BoostType.FOLLOWERS]: { '1k': 600, '2k': 1200, '3k': 1800, '4k': 2400, '5k': 3000 },
    [BoostType.VIEWS]: { '10k': 200, '20k': 350, '30k': 450, '40k': 550, '50k': 600 },
  },
  [PlatformId.YOUTUBE]: {
    [BoostType.LIKES]: { '1k': 250, '2k': 430, '3k': 600, '4k': 800, '5k': 1000 },
    [BoostType.VIEWS]: { '1k': 600, '2k': 1200, '3k': 1600, '4k': 2200, '5k': 2800 },
    [BoostType.SUBSCRIBERS]: { '1k': 800, '2k': 1500, '3k': 2100, '4k': 2700, '5k': 3400, '10k': 6650 },
  },
  [PlatformId.INSTAGRAM]: {
    [BoostType.LIKES]: { '1k': 70, '2k': 140, '3k': 210, '4k': 280, '5k': 350 },
    [BoostType.FOLLOWERS]: { '1k': 750, '2k': 1400, '3k': 2100, '4k': 2800, '5k': 3500 },
    [BoostType.VIEWS]: { '10k': 130, '20k': 260, '30k': 390, '40k': 520, '50k': 650 },
  },
};

export const calculatePrice = (platform: PlatformId | null, type: BoostType | null, qtyString: string | null): number => {
  if (!platform || !type || !qtyString) return 0;
  
  const platformPrices = PRICE_LIST[platform];
  if (!platformPrices) return 0;

  const typePrices = platformPrices[type];
  if (!typePrices) return 0;

  return typePrices[qtyString] || 0;
};
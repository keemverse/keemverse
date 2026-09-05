import { Instagram } from 'lucide-react';
import { TikTokIcon, PinterestIcon, BehanceIcon } from '../components/Icons';

// Single source of truth for KEEMVERSE's social links — used by
// SocialFooter and ContactPage. Update a URL once here and both
// places stay in sync.
export const socials = [
  { name: 'TikTok', icon: TikTokIcon, href: 'https://www.tiktok.com/@soft_keem' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/soft_keem?igsh=MXh3ajFpdzV2emlzdA%3D%3D&utm_source=qr' },
  { name: 'Pinterest', icon: PinterestIcon, href: 'https://pin.it/78T9RCsfV' },
  { name: 'Behance', icon: BehanceIcon, href: '#' }, // pending — Behance not decided yet
];

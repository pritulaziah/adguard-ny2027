import type { Interaction, Language, MascotInteraction } from './i18n';

interface MascotOffer {
  product: string;
  code: Record<Language, string>;
}

export const mascotOffers: Record<MascotInteraction, MascotOffer> = {
  agnar: { product: 'AdGuard', code: { en: 'NY2026', ru: 'NY2026' } },
  tengu: { product: 'AdGuard VPN', code: { en: 'NYVPN2026', ru: 'NYVPNRU2026' } },
  diana: { product: 'AdGuard DNS', code: { en: 'NYDNS2026', ru: 'NYDNS2026' } },
};

export function isMascotInteraction(key: Interaction): key is MascotInteraction {
  return key === 'agnar' || key === 'tengu' || key === 'diana';
}

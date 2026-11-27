import { expect, test } from 'vitest';
import { get } from 'svelte/store';
import { objectFact, objectFactCopy, objectNoteCopy } from './object-fact.ts';
import { language } from './i18n.ts';
import { figureFacts } from './figure-facts.ts';

test('each mascot gives the requested product code in both languages', () => {
  for (const [key, product, en, ru] of [
    ['agnar', 'AdGuard', 'NY2026', 'NY2026'],
    ['tengu', 'AdGuard VPN', 'NYVPN2026', 'NYVPNRU2026'],
    ['diana', 'AdGuard DNS', 'NYDNS2026', 'NYDNS2026'],
  ]) {
    for (const [language, code] of [
      ['en', en],
      ['ru', ru],
    ]) {
      const card = objectNoteCopy(key, language);
      expect(card.promo.code).toBe(code);
      expect(card.text).toContain(product);
      expect(card.promo.copy.length).toBeGreaterThan(0);
      expect(card.promo.error.length).toBeGreaterThan(0);
    }
  }
});

test('an open VPN card changes its code when the language changes', () => {
  const original = get(language);
  try {
    language.set('en');
    objectFact.set({ key: 'tengu', x: 200, y: 400, width: 400, height: 800 });
    expect(get(objectFactCopy).promo.code).toBe('NYVPN2026');
    language.set('ru');
    expect(get(objectFactCopy).promo.code).toBe('NYVPNRU2026');
    objectFact.set(null);
    expect(get(objectFactCopy)).toBeNull();
  } finally {
    objectFact.set(null);
    language.set(original);
  }
});

test('animal notes keep their facts without a promo button', () => {
  for (const [key, facts] of Object.entries(figureFacts)) {
    for (const language of ['en', 'ru']) {
      const card = objectNoteCopy(key, language);
      expect(card.promo).toBeNull();
      expect(card.text).toBe(facts[language]);
    }
  }
});

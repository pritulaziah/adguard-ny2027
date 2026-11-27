import { derived, writable } from 'svelte/store';
import { figureFacts } from './figure-facts.ts';
import { language } from './i18n.ts';
import type { Interaction, Language } from './i18n';
import { isMascotInteraction, mascotOffers } from './mascot-offers';

export interface FactPosition {
  key: Interaction;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The figure whose note is open, with its last screen position. */
export const objectFact = writable<FactPosition | null>(null);

export function objectNoteCopy(key: Interaction, language: Language) {
  const ru = language === 'ru';
  if (isMascotInteraction(key)) {
    const offer = mascotOffers[key];
    return {
      title: ru ? 'Новогодний подарок' : 'A New Year gift',
      close: ru ? 'Закрыть карточку' : 'Close the card',
      text: ru
        ? `Промокод на скидку для ${offer.product}. Введите его при оформлении покупки.`
        : `Use this promo code for a discount on ${offer.product}.`,
      promo: {
        code: offer.code[language],
        copy: ru ? 'Скопировать' : 'Copy code',
        copied: ru ? 'Скопировано!' : 'Copied!',
        error: ru
          ? 'Не удалось скопировать. Выделите код и скопируйте вручную.'
          : 'Could not copy. Select the code and copy it manually.',
      },
    };
  }
  return {
    title: ru ? 'А вы знали?' : 'Did you know?',
    close: ru ? 'Закрыть реплику' : 'Close the note',
    text: figureFacts[key][language],
    promo: null,
  };
}

export const objectFactCopy = derived([language, objectFact], ([$language, $fact]) => {
  return $fact ? objectNoteCopy($fact.key, $language) : null;
});

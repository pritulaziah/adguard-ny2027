import { derived, writable } from 'svelte/store';
import { figureFacts } from './figure-facts.ts';
import { language } from './i18n.ts';
import type { Interaction } from './i18n';

export interface FactPosition {
  key: Interaction;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The figure whose note is open, with its last screen position. */
export const objectFact = writable<FactPosition | null>(null);

export const objectFactCopy = derived([language, objectFact], ([$language, $fact]) => {
  if (!$fact) return null;
  return {
    title: $language === 'ru' ? 'А вы знали?' : 'Did you know?',
    close: $language === 'ru' ? 'Закрыть реплику' : 'Close the note',
    text: figureFacts[$fact.key][$language],
  };
});

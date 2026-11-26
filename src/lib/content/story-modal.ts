import { derived, writable } from 'svelte/store';
import { language } from './i18n.ts';

/** The article whose story dialog is open, or null. */
export const openStoryId = writable<string | null>(null);

export function openStory(id: string): void {
  openStoryId.set(id);
}

export function closeStory(): void {
  openStoryId.set(null);
}

/** Product name for the dialog eyebrow and the release label. */
export const storyProducts: Record<string, { ru: string; en: string }> = {
  'ios-pqc': { en: 'AdGuard for iOS', ru: 'AdGuard для iOS' },
  quest: { en: 'AdGuard on Meta Quest', ru: 'AdGuard на Meta Quest' },
  extension: { en: 'AdGuard Browser Extension', ru: 'Браузерное расширение AdGuard' },
  windows: { en: 'AdGuard for Windows', ru: 'AdGuard для Windows' },
  'mini-android': { en: 'AdGuard Mini for Android', ru: 'AdGuard Mini для Android' },
  home: { en: 'AdGuard Home', ru: 'AdGuard Home' },
};

const chrome = {
  en: {
    open: 'Explore the story',
    close: 'Close the story',
    read: 'Read the full release story',
    factTitle: 'Did you know?',
  },
  ru: {
    open: 'Посмотреть историю',
    close: 'Закрыть историю',
    read: 'Читать статью о релизе целиком',
    factTitle: 'А вы знали?',
  },
};

export const storyChrome = derived(language, value => chrome[value]);

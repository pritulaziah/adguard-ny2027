import { derived, writable } from 'svelte/store';

export type Language = 'en' | 'ru';
export type Interaction = 'deer' | 'snowman' | 'fire' | 'gate' | 'fox' | 'frog' | 'fish' | 'dragon' | 'crab' | 'cat' | 'bunny' | 'mail' | 'laptop' | 'lantern';

interface Copy {
  title: string; description: string; scene: string; canvas: string;
  loading: string; loadError: string; webglError: string; retry: string;
  language: string; station: string; story: string; year: string;
  read: string; welcomeTitle: string; welcomeSummary: string; welcomeNote: string;
  finalTitle: string; finalSummary: string;
  interactions: Record<Interaction, { label: string }>;
}

export const translations: Record<Language, Copy> = {
  en: {
    title: 'AdGuard · 2026 in Review', description: 'A train ride through a paper world of AdGuard\'s 2026 highlights.',
    scene: 'AdGuard 2026 journey through a paper world', canvas: 'A paper world with a train, four seasons, and stories on the walls',
    loading: 'Unfolding a paper world…', loadError: 'The paper world could not load. Refresh the page to try again.',
    webglError: 'The 3D scene could not open. Refresh the page in a browser with WebGPU or WebGL2 support.', retry: 'Try again',
    language: 'Language', station: 'New Year', story: 'STORY', year: '2026 IN REVIEW', read: 'Read the full story',
    welcomeTitle: 'Let’s remember\na good year', welcomeSummary: 'A little train. A big journey. Five stories about what we achieved together.',
    welcomeNote: 'Look around — this paper world is full of life.',
    finalTitle: 'Next stop —\na new year!', finalSummary: 'Thank you for being with us. Here’s to more good things and fewer distractions in 2027.',
    interactions: {
      deer: { label: 'Say hello to the deer' },
      snowman: { label: 'Wave to the snowman' },
      fire: { label: 'Warm up by the fire' },
      gate: { label: 'Open the gate' },
      fox: { label: 'Wake the fox' },
      frog: { label: 'Call the frog' },
      fish: { label: 'Nudge the fish' },
      dragon: { label: 'Say hello to the dragon' },
      crab: { label: 'Call the crab' },
      cat: { label: 'Call the cat' },
      bunny: { label: 'Say hello to the bunny' },
      mail: { label: 'Send a New Year letter' },
      laptop: { label: 'Open or close the paper laptop' },
      lantern: { label: 'Light the paper lantern' },
    },
  },
  ru: {
    title: 'AdGuard · Итоги 2026', description: 'Бумажное путешествие AdGuard: поезд и пять историй 2026 года.',
    scene: 'Бумажное путешествие AdGuard по итогам 2026 года', canvas: 'Бумажный мир: поезд, четыре времени года, истории на стенах',
    loading: 'Раскрываем бумажный мир…', loadError: 'Не удалось загрузить бумажный мир. Обновите страницу, чтобы попробовать ещё раз.',
    webglError: 'Не удалось открыть 3D-сцену. Обновите страницу в браузере с поддержкой WebGPU или WebGL2.', retry: 'Попробовать ещё раз',
    language: 'Язык', station: 'Новогодняя', story: 'ИСТОРИЯ', year: 'ИТОГИ 2026', read: 'Читать историю целиком',
    welcomeTitle: 'Вспомним\nхороший год', welcomeSummary: 'Маленький поезд. Большое путешествие. Пять историй о том, что мы сделали вместе.',
    welcomeNote: 'Оглядывайтесь по сторонам — здесь всё немного живое.',
    finalTitle: 'Следующая остановка —\nновый год!', finalSummary: 'Спасибо, что были с нами. Пусть в 2027 будет больше хорошего и меньше лишнего.',
    interactions: {
      deer: { label: 'Поздороваться с оленем' },
      snowman: { label: 'Помахать снеговику' },
      fire: { label: 'Согреться у костра' },
      gate: { label: 'Открыть калитку' },
      fox: { label: 'Разбудить лису' },
      frog: { label: 'Позвать лягушку' },
      fish: { label: 'Потревожить рыбку' },
      dragon: { label: 'Поздороваться с драконом' },
      crab: { label: 'Позвать краба' },
      cat: { label: 'Позвать кота' },
      bunny: { label: 'Поздороваться с зайцем' },
      mail: { label: 'Отправить новогоднее письмо' },
      laptop: { label: 'Открыть или закрыть бумажный ноутбук' },
      lantern: { label: 'Зажечь бумажный фонарь' },
    },
  },
};

const storageKey = 'adguard-ny27-language';
function initialLanguage(): Language {
  try { return localStorage.getItem(storageKey) === 'ru' ? 'ru' : 'en'; }
  catch { return 'en'; }
}
export const language = writable<Language>(initialLanguage());
export const copy = derived(language, value => translations[value]);
export function setLanguage(value: Language): void {
  language.set(value);
  try { localStorage.setItem(storageKey, value); } catch { /* Language selection also works without storage. */ }
}

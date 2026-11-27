import { derived, writable } from 'svelte/store';

export type Language = 'en' | 'ru';
export type FactInteraction = 'deer' | 'snowman' | 'fox' | 'hedgehog' | 'bird' | 'frog' | 'duck' | 'beaver' | 'bunny' | 'squirrel' | 'cat' | 'owl';
export type MascotInteraction = 'agnar' | 'tengu' | 'diana';
export type Interaction = FactInteraction | MascotInteraction;

interface Copy {
  title: string;
  description: string;
  scene: string;
  canvas: string;
  loading: string;
  loadError: string;
  webglError: string;
  retry: string;
  language: string;
  station: string;
  story: string;
  year: string;
  read: string;
  welcomeTitle: string;
  welcomeSummary: string;
  welcomeNote: string;
  finalTitle: string; finalSummary: string; finalNote: string;
  controls: { title: string; mouse: string; touch: string; keyboard: string; close: string };
  interactions: Record<Interaction, { label: string }>;
}

export const translations: Record<Language, Copy> = {
  en: {
    title: 'AdGuard · 2026 in Review', description: 'A paper journey through the AdGuard 2026 highlights.',
    scene: 'AdGuard 2026 journey through a paper world', canvas: 'A paper world with sleighs, four seasons, and stories on the walls',
    loading: 'Unfolding a paper world…', loadError: 'The paper world could not load. Refresh the page to try again.',
    webglError: 'The 3D scene could not open. Refresh the page in a browser with WebGPU or WebGL2 support.', retry: 'Try again',
    language: 'Language', station: 'New Year', story: 'STORY', year: '2026 IN REVIEW', read: 'Read the full story',
    welcomeTitle: 'Let’s remember\na good year', welcomeSummary: 'A big year. Six stories about what we achieved together.',
    welcomeNote: 'Look around — this paper world is full of life.',
    finalTitle: 'Next stop —\na new year!', finalSummary: 'Thank you for being with us. Here’s to more good things and fewer distractions in 2027.',
    finalNote: 'Each character has a New Year promo code for you.',
    controls: {
      title: 'How to explore',
      mouse: 'Scroll down to move forward. Scroll up to go back. A trackpad works too.',
      touch: 'Swipe up or left to move forward. Swipe down or right to go back.',
      keyboard: 'Hold → to move forward or ← to go back. Release to stop.', close: 'Got it',
    },
    interactions: {
      deer: { label: 'Say hello to the deer' },
      snowman: { label: 'Hear a fact about AdGuard for iOS' },
      fox: { label: 'Wake the fox' },
      hedgehog: { label: 'Say hello to the hedgehog' },
      bird: { label: 'Listen to the bird' },
      frog: { label: 'Call the frog' },
      beaver: { label: 'Say hello to the beaver' },
      duck: { label: 'Say hello to the duck' },
      cat: { label: 'Call the cat' },
      bunny: { label: 'Say hello to the bunny' },
      squirrel: { label: 'Call the squirrel' },
      owl: { label: 'Say hello to the owl' },
      agnar: { label: 'Get an AdGuard promo code from Agnar' },
      tengu: { label: 'Get an AdGuard VPN promo code from Tengu' },
      diana: { label: 'Get an AdGuard DNS promo code from Diana' },
    },
  },
  ru: {
    title: 'AdGuard · Итоги 2026', description: 'Бумажное путешествие AdGuard: шесть историй 2026 года.',
    scene: 'Бумажное путешествие AdGuard по итогам 2026 года', canvas: 'Бумажный мир: сани, четыре времени года, истории на стенах',
    loading: 'Раскрываем бумажный мир…', loadError: 'Не удалось загрузить бумажный мир. Обновите страницу, чтобы попробовать ещё раз.',
    webglError: 'Не удалось открыть 3D-сцену. Обновите страницу в браузере с поддержкой WebGPU или WebGL2.', retry: 'Попробовать ещё раз',
    language: 'Язык', station: 'Новогодняя', story: 'ИСТОРИЯ', year: 'ИТОГИ 2026', read: 'Читать историю целиком',
    welcomeTitle: 'Вспомним\nхороший год', welcomeSummary: 'Большой год. Шесть историй о том, что мы сделали вместе.',
    welcomeNote: 'Оглядывайтесь по сторонам — здесь всё немного живое.',
    finalTitle: 'Следующая остановка —\nновый год!', finalSummary: 'Спасибо, что были с нами. Пусть в 2027 будет больше хорошего и меньше лишнего.',
    finalNote: 'У каждого персонажа — новогодний промокод.',
    controls: {
      title: 'Как управлять',
      mouse: 'Прокручивайте вниз, чтобы двигаться вперёд. Прокручивайте вверх, чтобы вернуться. Можно использовать тачпад.',
      touch: 'Проведите вверх или влево, чтобы двигаться вперёд. Проведите вниз или вправо, чтобы вернуться.',
      keyboard: 'Удерживайте → для движения вперёд или ← для движения назад. Отпустите клавишу, чтобы остановиться.', close: 'Понятно',
    },
    interactions: {
      deer: { label: 'Поздороваться с оленем' },
      snowman: { label: 'Узнать факт об AdGuard для iOS' },
      fox: { label: 'Разбудить лису' },
      hedgehog: { label: 'Поздороваться с ежом' },
      bird: { label: 'Послушать птицу' },
      frog: { label: 'Позвать лягушку' },
      beaver: { label: 'Поздороваться с бобром' },
      duck: { label: 'Поздороваться с уткой' },
      cat: { label: 'Позвать кота' },
      bunny: { label: 'Поздороваться с зайцем' },
      squirrel: { label: 'Позвать белку' },
      owl: { label: 'Поздороваться с совой' },
      agnar: { label: 'Получить промокод на AdGuard у Агнара' },
      tengu: { label: 'Получить промокод на AdGuard VPN у Тэнгу' },
      diana: { label: 'Получить промокод на AdGuard DNS у Дианы' },
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

import { derived, writable } from 'svelte/store';

export type Language = 'en' | 'ru';
export type Interaction = 'deer' | 'snowman' | 'fire' | 'gate' | 'fox' | 'frog' | 'fish' | 'dragon' | 'crab' | 'cat' | 'bunny' | 'mail' | 'laptop' | 'lantern';

interface Copy {
  title: string; description: string; scene: string; canvas: string;
  loading: string; loadError: string; webglError: string; retry: string;
  language: string; station: string; story: string; year: string;
  read: string; welcomeTitle: string; welcomeSummary: string; welcomeNote: string;
  finalTitle: string; finalSummary: string;
  travelHint: string;
  interactions: Record<Interaction, { label: string; message: string }>;
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
    travelHint: 'Look around — the story continues.',
    interactions: {
      deer: { label: 'Say hello to the deer', message: 'The deer is happy to see you, too.' },
      snowman: { label: 'Wave to the snowman', message: 'The snowman waves you on your way!' },
      fire: { label: 'Warm up by the fire', message: 'That feels a little warmer.' },
      gate: { label: 'Open the gate', message: 'The gate is open. Welcome to the garden!' },
      fox: { label: 'Wake the fox', message: 'It looks like the fox noticed our bicycle.' },
      frog: { label: 'Call the frog', message: 'Hop! A hello from the paper pond.' },
      fish: { label: 'Nudge the fish', message: 'Little wonders happen by the sea, too.' },
      dragon: { label: 'Say hello to the dragon', message: 'The dragon sends a New Year greeting.' },
      crab: { label: 'Call the crab', message: 'The crab is in a festive mood, too.' },
      cat: { label: 'Call the cat', message: 'The cat watches as you pass.' },
      bunny: { label: 'Say hello to the bunny', message: 'Someone is always waiting along the way.' },
      mail: { label: 'Send a New Year letter', message: 'Letter sent. Good wishes always find their way.' },
      laptop: { label: 'Open or close the paper laptop', message: 'Even a laptop needs a rest sometimes.' },
      lantern: { label: 'Light the paper lantern', message: 'May the new year bring more warmth and light.' },
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
    travelHint: 'Смотрите по сторонам — история продолжается.',
    interactions: {
      deer: { label: 'Поздороваться с оленем', message: 'Олень тоже рад вас видеть.' },
      snowman: { label: 'Помахать снеговику', message: 'Снеговик машет вам вслед!' },
      fire: { label: 'Согреться у костра', message: 'Теперь немного теплее.' },
      gate: { label: 'Открыть калитку', message: 'Калитка открыта. Добро пожаловать в сад!' },
      fox: { label: 'Разбудить лису', message: 'Кажется, лиса заметила наш велосипед.' },
      frog: { label: 'Позвать лягушку', message: 'Прыг! Привет из бумажного пруда.' },
      fish: { label: 'Потревожить рыбку', message: 'На море тоже случаются маленькие чудеса.' },
      dragon: { label: 'Поздороваться с драконом', message: 'Дракон передаёт новогодний привет.' },
      crab: { label: 'Позвать краба', message: 'У краба тоже праздничное настроение.' },
      cat: { label: 'Позвать кота', message: 'Кот решил проводить вас взглядом.' },
      bunny: { label: 'Поздороваться с зайцем', message: 'За каждым поворотом кто-то ждёт.' },
      mail: { label: 'Отправить новогоднее письмо', message: 'Письмо отправлено. Хорошие пожелания всегда находят адресата.' },
      laptop: { label: 'Открыть или закрыть бумажный ноутбук', message: 'Даже ноутбуку иногда нужен отдых.' },
      lantern: { label: 'Зажечь бумажный фонарь', message: 'Пусть в новом году будет больше тёплого света.' },
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

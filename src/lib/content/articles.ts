import type { Language } from './i18n';

const base = import.meta.env ? import.meta.env.BASE_URL : '';

export interface Article {
  id: string;
  title: string;
  summary: string;
  stat: string;
  statLabel: string;
  facts: string[];
  hiddenFact: string;
  image: string;
  imageAlt: string;
  link: string;
  station: string;
  color: string;
}

/** Text that changes with the language; everything else is shared. */
interface StoryCopy {
  station: string;
  title: string;
  summary: string;
  statLabel: string;
  facts: string[];
  hiddenFact: string;
  imageAlt: string;
}

interface Story {
  id: string;
  /** Blog address without the language segment. */
  slug: string;
  /** Set only when the Russian blog uses another address. */
  ruSlug?: string;
  color: string;
  stat: string;
  image: string;
  ru: StoryCopy;
  en: StoryCopy;
}

const stories: Story[] = [
  {
    id: 'ios-pqc',
    slug: 'adguard-for-ios-v4-5-15',
    color: '#526c84',
    stat: '4.5.15',
    image: `${base}blog/ios-pqc.webp`,
    ru: {
      station: 'Защищённая',
      title: 'iOS 4.5.15: постквантовая защита',
      summary: 'AdGuard для iOS 4.5.15 добавил постквантовую криптографию в DNS и обновил SafariConverterLib.',
      statLabel: 'постквантовая защита DNS',
      facts: ['Постквантовая криптография в DNS', 'Обновлённый SafariConverterLib'],
      hiddenFact: 'В версии 4.5.15 обновились и DNS-защита, и SafariConverterLib.',
      imageAlt: 'Иллюстрация AdGuard для iOS',
    },
    en: {
      station: 'Secure',
      title: 'iOS v4.5.15: post-quantum',
      summary: 'AdGuard for iOS 4.5.15 adds post-quantum cryptography to DNS and updates SafariConverterLib.',
      statLabel: 'post-quantum DNS protection',
      facts: ['Post-quantum cryptography in DNS', 'Updated SafariConverterLib'],
      hiddenFact: 'Version 4.5.15 updates both DNS protection and SafariConverterLib.',
      imageAlt: 'AdGuard for iOS illustration',
    },
  },
  {
    id: 'quest',
    slug: 'adguard-adblocker-vr-meta-quest',
    color: '#876447',
    stat: 'Meta Quest',
    image: `${base}blog/quest.webp`,
    ru: {
      station: 'Виртуальная',
      title: 'AdGuard на Meta Quest',
      summary:
        'AdGuard появился на Meta Quest как одно из первых расширений для блокировки рекламы в Meta Quest Browser.',
      statLabel: 'блокировка рекламы на Meta Quest',
      facts: ['Одно из первых расширений-блокировщиков для Meta Quest Browser', 'Расширение для браузера Meta Quest'],
      hiddenFact: 'Это одно из первых расширений для блокировки рекламы в Meta Quest Browser.',
      imageAlt: 'Иллюстрация AdGuard на Meta Quest',
    },
    en: {
      station: 'Virtual',
      title: 'AdGuard on Meta Quest',
      summary:
        'AdGuard comes to Meta Quest as one of the first ad-blocking browser extensions for the Meta Quest Browser.',
      statLabel: 'ad blocking on Meta Quest',
      facts: ['One of the first ad-blocking extensions for Meta Quest Browser', 'A browser extension for Meta Quest'],
      hiddenFact: 'The extension is one of the first ad blockers built for the Meta Quest Browser.',
      imageAlt: 'AdGuard on Meta Quest illustration',
    },
  },
  {
    id: 'extension',
    slug: 'adguard-browser-extension-v5-4',
    color: '#56744e',
    stat: '5.4',
    image: `${base}blog/extension.jpg`,
    ru: {
      station: 'Браузерная',
      title: 'Браузерное расширение 5.4',
      summary:
        'Браузерное расширение AdGuard 5.4 делает фильтрацию надёжнее и предсказуемее, добавляет общие настройки и более понятный интерфейс.',
      statLabel: 'стабильная фильтрация и общие настройки',
      facts: ['Надёжная и предсказуемая фильтрация', 'Общие настройки и понятный интерфейс'],
      hiddenFact: 'В версии 5.4 настройками можно поделиться.',
      imageAlt: 'Иллюстрация Браузерного расширения AdGuard',
    },
    en: {
      station: 'Browser',
      title: 'Browser Extension v5.4',
      summary:
        'AdGuard Browser Extension 5.4 makes filtering more reliable and predictable, adds shareable settings, and clears up the interface.',
      statLabel: 'steadier filtering and shared settings',
      facts: ['More reliable and predictable filtering', 'Shareable settings and a clearer interface'],
      hiddenFact: 'Version 5.4 lets you share your settings.',
      imageAlt: 'AdGuard Browser Extension illustration',
    },
  },
  {
    id: 'windows',
    slug: 'adguard-for-windows-v8-0',
    color: '#43745b',
    stat: '8.0',
    image: `${base}blog/windows.webp`,
    ru: {
      station: 'Настольная',
      title: 'Windows 8.0',
      summary:
        'AdGuard для Windows 8.0 получил полностью новый дизайн, общесистемную сетевую фильтрацию и контроль над трафиком приложений и трекингом.',
      statLabel: 'обновлённое приложение для Windows',
      facts: ['Полностью новый дизайн', 'Общесистемная фильтрация и контроль трафика приложений'],
      hiddenFact: 'В версии 8.0 фильтрация работает на уровне всей системы.',
      imageAlt: 'Иллюстрация AdGuard для Windows',
    },
    en: {
      station: 'Windows',
      title: 'Windows v8.0',
      summary:
        'AdGuard for Windows 8.0 brings a full redesign, system-wide network filtering, and control over app traffic and tracking.',
      statLabel: 'a redesigned Windows app',
      facts: ['Full redesign', 'System-wide filtering and control over app traffic'],
      hiddenFact: 'Version 8.0 filters traffic across the whole system.',
      imageAlt: 'AdGuard for Windows illustration',
    },
  },
  {
    id: 'mini-android',
    slug: 'adguard-mini-v3-0-for-android',
    color: '#56744e',
    stat: '3.0',
    image: `${base}blog/mini-android.webp`,
    ru: {
      station: 'Мобильная',
      title: 'Больше, чем браузер',
      summary:
        'AdGuard Content Blocker стал AdGuard Mini для Android. В версии 3.0 защита вышла за пределы браузерных вкладок.',
      statLabel: 'AdGuard Mini для Android',
      facts: ['DNS-защита для всего устройства', 'Видеобраузер и статистика'],
      hiddenFact: 'AdGuard Mini доступен в Google Play.',
      imageAlt: 'AdGuard Mini для Android',
    },
    en: {
      station: 'Mobile',
      title: 'Beyond the browser',
      summary:
        'AdGuard Content Blocker became AdGuard Mini for Android. Version 3.0 takes protection beyond browser tabs.',
      statLabel: 'AdGuard Mini for Android',
      facts: ['Device-wide DNS protection', 'Video browser and statistics'],
      hiddenFact: 'AdGuard Mini is available on Google Play.',
      imageAlt: 'AdGuard Mini for Android',
    },
  },
  {
    id: 'home',
    slug: 'adguard-home-v-1-0',
    ruSlug: 'adguard-home-v1-0',
    color: '#43745b',
    stat: '1.0',
    image: `${base}blog/home.jpg`,
    ru: {
      station: 'Домашняя',
      title: 'AdGuard Home 1.0',
      summary:
        'Большой шаг для домашней сети: стабильная версия, обновлённый интерфейс и привычный контроль над защитой всех устройств.',
      statLabel: 'первая стабильная версия',
      facts: ['Обновлённый интерфейс', 'Новая система нумерации версий'],
      hiddenFact: 'Путь AdGuard Home начался с прототипа в 2018 году.',
      imageAlt: 'Иллюстрация AdGuard Home',
    },
    en: {
      station: 'Home',
      title: 'AdGuard Home 1.0',
      summary:
        'A big step for your home network: a stable release, a refreshed interface, and control over protection for every device.',
      statLabel: 'the first stable release',
      facts: ['Refreshed interface', 'New version numbering'],
      hiddenFact: 'AdGuard Home began as a prototype in 2018.',
      imageAlt: 'AdGuard Home illustration',
    },
  },
];

function blogSlug(story: Story, language: Language): string {
  return language === 'ru' ? (story.ruSlug ?? story.slug) : story.slug;
}

function toArticle(story: Story, language: Language): Article {
  const copy = story[language];
  return {
    id: story.id,
    station: copy.station,
    color: story.color,
    title: copy.title,
    summary: copy.summary,
    stat: story.stat,
    statLabel: copy.statLabel,
    facts: copy.facts,
    hiddenFact: copy.hiddenFact,
    image: story.image,
    imageAlt: copy.imageAlt,
    link: `https://adguard.com/${language}/blog/${blogSlug(story, language)}.html`,
  };
}

export const articlesByLanguage: Record<Language, Article[]> = {
  ru: stories.map(story => toArticle(story, 'ru')),
  en: stories.map(story => toArticle(story, 'en')),
};

export const articles = articlesByLanguage.ru;

export const homeStoryStop = stories.findIndex(story => story.id === 'home') + 1;

export function findHomeArticle(language: Language): Article | undefined {
  return articlesByLanguage[language].find(article => article.id === 'home');
}

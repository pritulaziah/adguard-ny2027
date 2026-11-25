const base = import.meta.env.BASE_URL;

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

export const articles: Article[] = [
  {
    id: 'home', station: 'Домашняя', color: '#43745b',
    title: 'AdGuard Home 1.0',
    summary: 'Большой шаг для домашней сети: стабильная версия, обновлённый интерфейс и привычный контроль над защитой всех устройств.',
    stat: '1.0', statLabel: 'первая стабильная версия',
    facts: ['Обновлённый интерфейс', 'Новая система нумерации версий'],
    hiddenFact: 'Путь AdGuard Home начался с прототипа в 2018 году.',
    image: `${base}blog/home.jpg`, imageAlt: 'Иллюстрация AdGuard Home',
    link: 'https://adguard.com/ru/blog/adguard-home-v-1-0.html',
  },
  {
    id: 'mini-android', station: 'Мобильная', color: '#56744e',
    title: 'Больше, чем браузер',
    summary: 'AdGuard Content Blocker стал AdGuard Mini для Android. В версии 3.0 защита вышла за пределы браузерных вкладок.',
    stat: '3.0', statLabel: 'AdGuard Mini для Android',
    facts: ['DNS-защита для всего устройства', 'Видеобраузер и статистика'],
    hiddenFact: 'AdGuard Mini доступен в Google Play.',
    image: `${base}blog/mini-android.png`, imageAlt: 'AdGuard Mini для Android',
    link: 'https://adguard.com/ru/blog/adguard-mini-v3-0-for-android.html',
  },
  {
    id: 'mini-mac', station: 'Яблочная', color: '#876447',
    title: 'Легче. Быстрее. Mini.',
    summary: 'AdGuard Mini для Mac 3.0 получил интерфейс на WKWebView и экспериментальную защиту за пределами Safari.',
    stat: '3.0', statLabel: 'AdGuard Mini для Mac',
    facts: ['Меньше нагрузка на память и процессор', 'Первые шаги к защите всей системы'],
    hiddenFact: 'В новой версии началась работа над поддержкой экранных дикторов.',
    image: `${base}blog/mini-mac.jpg`, imageAlt: 'AdGuard Mini для Mac',
    link: 'https://adguard.com/ru/blog/adguard-mini-for-mac-v3-0.html',
  },
  {
    id: 'mail', station: 'Почтовая', color: '#a05d4d',
    title: 'Письма без знакомства',
    summary: 'В AdGuard Mail 1.7 появился гостевой режим: временный адрес и входящие письма доступны без регистрации.',
    stat: '1.7', statLabel: 'гостевой режим AdGuard Mail',
    facts: ['Временная почта без аккаунта', 'Получение и чтение писем сразу'],
    hiddenFact: 'Для гостевого режима не нужно указывать банковскую карту.',
    image: `${base}blog/mail.jpg`, imageAlt: 'Иллюстрация AdGuard Mail',
    link: 'https://adguard.com/ru/blog/adguard-mail-v1-7.html',
  },
  {
    id: 'emudhra', station: 'Надёжная', color: '#526c84',
    title: 'Защита без выходных',
    summary: 'После инцидента с сертификатами eMudhra мы выпустили срочные обновления приложений для безопасной HTTPS-фильтрации.',
    stat: 'HTTPS', statLabel: 'внимание к безопасности соединений',
    facts: ['Срочные обновления приложений', 'Проверка сертификатов при фильтрации'],
    hiddenFact: 'При HTTPS-фильтрации AdGuard самостоятельно проверяет сертификаты серверов.',
    image: `${base}blog/emudhra.jpg`, imageAlt: 'Замок как символ безопасности',
    link: 'https://adguard.com/ru/blog/emudhra-certificate-incident.html',
  },
];

export const articleStops = [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6];

const english: Array<Pick<Article, 'station' | 'title' | 'summary' | 'statLabel' | 'facts' | 'hiddenFact' | 'imageAlt'>> = [
  {
    station: 'Home', title: 'AdGuard Home 1.0',
    summary: 'A big step for your home network: a stable release, a refreshed interface, and control over protection for every device.',
    statLabel: 'the first stable release', facts: ['Refreshed interface', 'New version numbering'],
    hiddenFact: 'AdGuard Home began as a prototype in 2018.', imageAlt: 'AdGuard Home illustration',
  },
  {
    station: 'Mobile', title: 'Beyond the browser',
    summary: 'AdGuard Content Blocker became AdGuard Mini for Android. Version 3.0 takes protection beyond browser tabs.',
    statLabel: 'AdGuard Mini for Android', facts: ['Device-wide DNS protection', 'Video browser and statistics'],
    hiddenFact: 'AdGuard Mini is available on Google Play.', imageAlt: 'AdGuard Mini for Android',
  },
  {
    station: 'Mac', title: 'Lighter. Faster. Mini.',
    summary: 'AdGuard Mini for Mac 3.0 introduces a WKWebView interface and experimental protection beyond Safari.',
    statLabel: 'AdGuard Mini for Mac', facts: ['Lower memory and CPU use', 'First steps toward system-wide protection'],
    hiddenFact: 'This release begins work on screen reader support.', imageAlt: 'AdGuard Mini for Mac',
  },
  {
    station: 'Mail', title: 'No sign-up. Just mail.',
    summary: 'AdGuard Mail 1.7 adds guest mode: get a temporary address and receive email without creating an account.',
    statLabel: 'AdGuard Mail guest mode', facts: ['Temporary email without an account', 'Receive and read messages right away'],
    hiddenFact: 'Guest mode does not require a bank card.', imageAlt: 'AdGuard Mail illustration',
  },
  {
    station: 'Security', title: 'Protection never rests',
    summary: 'After the eMudhra certificate incident, we released urgent app updates to keep HTTPS filtering secure.',
    statLabel: 'keeping connections secure', facts: ['Urgent app updates', 'Certificate checks during filtering'],
    hiddenFact: 'AdGuard checks server certificates independently during HTTPS filtering.', imageAlt: 'A lock as a symbol of security',
  },
];

export const articlesByLanguage = {
  ru: articles,
  en: articles.map((article, index): Article => ({
    ...article, ...english[index], link: article.link.replace('/ru/blog/', '/en/blog/'),
  })),
};

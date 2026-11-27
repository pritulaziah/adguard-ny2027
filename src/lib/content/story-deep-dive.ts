import type { Language } from './i18n';

const base = import.meta.env ? import.meta.env.BASE_URL : '';

export interface StoryShot {
  label: string;
  title: string;
  image: string;
  alt: string;
}
export interface StoryPassage {
  heading: string;
  body: string;
}
export interface StoryTimeline {
  from: string;
  fromLabel: string;
  to: string;
  toLabel: string;
}
export interface StoryDeepDive {
  lead: string;
  timeline: StoryTimeline;
  passages: StoryPassage[];
  afterword: string;
  shots?: StoryShot[];
}

export const deepDives: Record<string, Record<Language, StoryDeepDive>> = {
  'ios-pqc': {
    en: {
      lead: 'AdGuard for iOS 4.5.15 brings post-quantum cryptography to DNS and smoother rule handling in Safari.',
      timeline: { from: '4.5', fromLabel: 'the previous iOS release', to: '4.5.15', toLabel: 'post-quantum DNS' },
      passages: [
        {
          heading: 'Post-quantum DNS',
          body: 'DnsLibs 2.7 adds post-quantum cryptography to DNS over HTTPS, TLS, and QUIC. Protection turns on when you enable DNS protection and pick an AdGuard DNS server.',
        },
        {
          heading: 'Smoother Safari filtering',
          body: 'SafariConverterLib now handles complex filtering rules more efficiently. Pages come out cleaner, and tricky ads are easier to catch.',
        },
      ],
      afterword: 'DNS requests now carry encryption built for the threats of the coming years.',
    },
    ru: {
      lead: 'AdGuard для iOS 4.5.15 добавляет постквантовое шифрование в DNS и делает фильтрацию в Safari точнее.',
      timeline: { from: '4.5', fromLabel: 'прошлая версия iOS', to: '4.5.15', toLabel: 'постквантовый DNS' },
      passages: [
        {
          heading: 'Постквантовый DNS',
          body: 'DnsLibs 2.7 добавил постквантовое шифрование в DNS по DoH, DoT и DoQ. Защита включается сама при включённой DNS-защите и сервере AdGuard DNS.',
        },
        {
          heading: 'Точнее фильтрация в Safari',
          body: 'SafariConverterLib теперь эффективнее обрабатывает сложные правила фильтрации. Это даёт более чистые страницы и лучше справляется со сложной рекламой.',
        },
      ],
      afterword: 'DNS-запросы теперь защищены шифрованием, рассчитанным на будущие угрозы.',
    },
  },
  quest: {
    en: {
      lead: 'AdGuard arrives in Meta Quest Browser as one of the first ad blockers for VR, with support for Quest 2, Pro, 3, and 3S.',
      timeline: { from: '5.2', fromLabel: 'the browser extension', to: 'Meta Quest', toLabel: 'ad blocking in VR' },
      passages: [
        {
          heading: 'One of the first',
          body: 'AdGuard is one of the first ad-blocking extensions for Meta Quest Browser. The platform supports around 10 extensions in total.',
        },
        {
          heading: 'Four headsets',
          body: 'AdGuard works on Quest 2, Quest Pro, Quest 3, and Quest 3S. It blocks ads, trackers, pop-ups, and malicious websites.',
        },
        {
          heading: 'Extension 5.2 or newer',
          body: 'Meta Quest Browser needs AdGuard Browser Extension 5.2 or newer. After installation, the extension behaves like its Chrome version.',
        },
      ],
      afterword: 'VR browsing now gets the same clean, private web as the desktop.',
    },
    ru: {
      lead: 'AdGuard появился в браузере Meta Quest как один из первых блокировщиков рекламы для VR — на Quest 2, Quest Pro, Quest 3 и Quest 3S.',
      timeline: { from: '5.2', fromLabel: 'версия расширения', to: 'Meta Quest', toLabel: 'блокировка в VR' },
      passages: [
        {
          heading: 'Один из первых',
          body: 'AdGuard вошёл в число первых расширений для блокировки рекламы в браузере Meta Quest. Всего платформа поддерживает около 10 расширений.',
        },
        {
          heading: 'Четыре шлема',
          body: 'AdGuard работает на Quest 2, Quest Pro, Quest 3 и Quest 3S. Он блокирует рекламу, трекеры, всплывающие окна и вредоносные сайты.',
        },
        {
          heading: 'Расширение 5.2 и новее',
          body: 'Для браузера Meta Quest нужна версия Браузерного расширения AdGuard 5.2 или новее. После установки расширение работает как версия для Chrome.',
        },
      ],
      afterword: 'В VR появился тот же чистый и приватный интернет, что и на компьютере.',
    },
  },
  extension: {
    en: {
      lead: 'AdGuard Browser Extension 5.4 makes filtering more reliable, lets you share your settings, and adds prompts that prevent mistakes.',
      timeline: { from: '5.3', fromLabel: 'the previous extension', to: '5.4', toLabel: 'shareable settings' },
      passages: [
        {
          heading: 'Independent filter updates',
          body: 'Custom filters in MV3 update separately from the extension again. Blocking stays accurate and reacts to changes faster.',
        },
        {
          heading: 'Settings as a link',
          body: 'You can share all extension settings with one link. It helps on a new device, after a reinstall, or in a support chat.',
        },
        {
          heading: 'Fewer wrong turns',
          body: 'AdGuard checks custom filter sources and pulls the domain from a full allowlist URL. Invert Allowlist now asks for confirmation.',
        },
      ],
      afterword: 'The release makes filtering steadier and setup easy to repeat on any device.',
    },
    ru: {
      lead: 'Браузерное расширение AdGuard 5.4 делает фильтрацию надёжнее, добавляет общий доступ к настройкам и подсказки в интерфейсе.',
      timeline: { from: '5.3', fromLabel: 'прошлое расширение', to: '5.4', toLabel: 'общие настройки' },
      passages: [
        {
          heading: 'Фильтры обновляются сами',
          body: 'Собственные фильтры в MV3 снова обновляются отдельно от расширения. Блокировка работает точнее и быстрее реагирует на изменения.',
        },
        {
          heading: 'Настройки одной ссылкой',
          body: 'Все настройки расширения можно передать ссылкой. Это помогает на новом устройстве, после переустановки браузера и в переписке с поддержкой.',
        },
        {
          heading: 'Меньше случайных ошибок',
          body: 'Расширение проверяет источник фильтра при добавлении по URL. Из полного адреса страницы в белом списке оно выделяет домен, а для инвертированного списка просит подтверждение.',
        },
      ],
      afterword: 'Релиз делает фильтрацию стабильнее, а настройку легко повторить на любом устройстве.',
    },
  },
  windows: {
    en: {
      lead: 'AdGuard for Windows 8.0 rebuilds the app around system-wide filtering, with new sections for app control and statistics.',
      timeline: { from: '7', fromLabel: 'the previous design', to: '8.0', toLabel: 'system-wide filtering' },
      passages: [
        {
          heading: 'Every app, filtered',
          body: 'A network driver now filters traffic from every app on the device, not only browsers. Browsers still make about 55–60% of desktop traffic.',
        },
        {
          heading: 'Apps and statistics',
          body: 'Two new sections show which apps go online and let you route their traffic through AdGuard. Statistics breaks requests down by company, app, and domain.',
        },
        {
          heading: 'A complete redesign',
          body: 'The app was rebuilt from scratch with key tools on the first screen. Advanced settings moved deeper but stay available.',
        },
      ],
      afterword: 'Protection now covers the whole computer, and the app finally looks the part.',
    },
    ru: {
      lead: 'AdGuard для Windows 8.0 перестраивает приложение вокруг общесистемной фильтрации и добавляет разделы для контроля приложений и статистики.',
      timeline: { from: '7', fromLabel: 'прежний дизайн', to: '8.0', toLabel: 'фильтрация всей системы' },
      passages: [
        {
          heading: 'Фильтрация всех программ',
          body: 'Сетевой драйвер теперь фильтрует трафик каждой программы на компьютере, а не только браузеров. Через браузеры по-прежнему проходит около 55–60% трафика.',
        },
        {
          heading: 'Приложения и статистика',
          body: 'Два новых раздела показывают, какие программы выходят в сеть, и позволяют направлять их трафик через AdGuard. Статистика разбивает запросы по компаниям, приложениям и доменам.',
        },
        {
          heading: 'Полный редизайн',
          body: 'Интерфейс переработали с нуля: главные инструменты теперь на первом экране. Продвинутые настройки убрали глубже, но оставили доступными.',
        },
      ],
      afterword: 'Защита теперь покрывает весь компьютер, и приложение наконец выглядит под стать.',
    },
  },
  'mini-android': {
    en: {
      lead: 'AdGuard Content Blocker becomes AdGuard Mini for Android 3.0, with device-wide DNS protection, a video browser, and statistics.',
      timeline: {
        from: 'Content Blocker',
        fromLabel: 'browser-only protection',
        to: '3.0',
        toLabel: 'protection for the device',
      },
      passages: [
        {
          heading: 'A new name, new scope',
          body: 'AdGuard Content Blocker is now AdGuard Mini for Android. Browser protection stays in Samsung Browser and Yandex Browser, with reorganized filters.',
        },
        {
          heading: 'DNS protection for the device',
          body: 'DNS protection blocks ads and trackers in apps and other browsers. It works before requests reach the phone or tablet.',
        },
        {
          heading: 'Video browser and statistics',
          body: 'Video browser opens YouTube videos without ads. Statistics shows how many DNS requests AdGuard Mini blocked and lists recent activity.',
        },
      ],
      afterword: 'A modest browser blocker grew into a lightweight version of the full AdGuard app.',
    },
    ru: {
      lead: 'AdGuard Content Blocker стал AdGuard Mini для Android 3.0: DNS-защита на всём устройстве, видеобраузер и статистика.',
      timeline: {
        from: 'Content Blocker',
        fromLabel: 'защита только в браузере',
        to: '3.0',
        toLabel: 'защита всего устройства',
      },
      passages: [
        {
          heading: 'Новое имя, новая область',
          body: 'AdGuard Content Blocker теперь называется AdGuard Mini для Android. Защита в Samsung Browser и Яндекс Браузере осталась, а фильтры переработали.',
        },
        {
          heading: 'DNS-защита для устройства',
          body: 'DNS-защита блокирует рекламу и трекеры в приложениях и других браузерах. Она срабатывает до того, как запросы попадут на телефон или планшет.',
        },
        {
          heading: 'Видеобраузер и статистика',
          body: 'Видеобраузер открывает видео на YouTube без рекламы. Статистика показывает, сколько DNS-запросов заблокировало приложение, и список недавней активности.',
        },
      ],
      afterword: 'Скромный браузерный блокировщик стал облегчённой версией полноценного приложения AdGuard.',
    },
  },
  home: {
    en: {
      lead: 'From the first preview in 2018 to version 1.0 in 2026 — a familiar home for your network, rebuilt for what comes next.',
      timeline: { from: '2018', fromLabel: 'the first preview', to: '2026', toLabel: 'version 1.0' },
      passages: [
        {
          heading: 'Rebuilt from the ground up',
          body: 'The interface has a new frontend, lower memory use, and a layout for phones and desktops. The sections stayed where they were.',
        },
        {
          heading: 'Three screens gain more',
          body: 'Client settings assign profiles and rules per device. The query log adds sorting and filtering, and the filters section gathers lists in one place.',
        },
        {
          heading: 'The same configuration',
          body: 'Version 1.0 keeps the configuration schema of v0.107.x. AdGuardHome.yaml and the data directory work without changes.',
        },
      ],
      afterword: 'Built with the community. Ready for the next chapter.',
      shots: [
        {
          label: '01 / BEFORE',
          title: 'The interface before 1.0',
          image: `${base}blog/home/dashboard-before.png`,
          alt: 'AdGuard Home dashboard before version 1.0',
        },
        {
          label: '02 / AFTER',
          title: 'The interface after 1.0',
          image: `${base}blog/home/dashboard-after.png`,
          alt: 'AdGuard Home dashboard after version 1.0',
        },
      ],
    },
    ru: {
      lead: 'От первого прототипа в 2018 году до версии 1.0 в 2026-м — привычный дом для вашей сети, готовый к дальнейшему развитию.',
      timeline: { from: '2018', fromLabel: 'первый прототип', to: '2026', toLabel: 'версия 1.0' },
      passages: [
        {
          heading: 'Интерфейс перестроили с нуля',
          body: 'У интерфейса новый фронтенд, меньшее потребление памяти и вёрстка для телефонов и компьютеров. Разделы остались на привычных местах.',
        },
        {
          heading: 'Три экрана с новыми возможностями',
          body: 'В настройках клиентов появились профили и правила для каждого устройства. В журнале запросов добавились сортировка и фильтрация, а раздел фильтров собрал списки в одном месте.',
        },
        {
          heading: 'Та же схема конфигурации',
          body: 'Версия 1.0 сохраняет схему конфигурации v0.107.x. Файл AdGuardHome.yaml и каталог данных работают без изменений.',
        },
      ],
      afterword: 'Создан вместе с сообществом. Готов к новой главе.',
      shots: [
        {
          label: '01 / ДО',
          title: 'Интерфейс до 1.0',
          image: `${base}blog/home/dashboard-before.png`,
          alt: 'Панель AdGuard Home до версии 1.0',
        },
        {
          label: '02 / ПОСЛЕ',
          title: 'Интерфейс после 1.0',
          image: `${base}blog/home/dashboard-after.png`,
          alt: 'Панель AdGuard Home после версии 1.0',
        },
      ],
    },
  },
};

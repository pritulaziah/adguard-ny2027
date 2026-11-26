import type { Interaction, Language } from './i18n';

export const figureFacts: Record<Interaction, Record<Language, string>> = {
  deer: {
    en: 'Click the glowing marks on figures and objects to learn a fact about this year.',
    ru: 'Нажимайте на светящиеся значки у фигур и предметов — узнаете факт об этом годе.',
  },
  snowman: {
    en: 'SafariConverterLib in iOS 4.5.15 handles complex filtering rules faster, so tricky ads are easier to catch.',
    ru: 'SafariConverterLib в iOS 4.5.15 быстрее обрабатывает сложные правила фильтрации, поэтому хитрую рекламу легче поймать.',
  },
  gate: {
    en: 'Version 5.4 can share all extension settings as a link, handy after a browser reinstall.',
    ru: 'В версии 5.4 все настройки расширения можно передать ссылкой — удобно после переустановки браузера.',
  },
  fox: {
    en: 'Meta Quest Browser supports around 10 extensions, and AdGuard is one of the first ad blockers there.',
    ru: 'В браузере Meta Quest поддерживается около 10 расширений, и AdGuard — один из первых блокировщиков среди них.',
  },
  frog: {
    en: 'In version 5.4, custom filters in MV3 can update separately from the extension again.',
    ru: 'В версии 5.4 собственные фильтры в MV3 снова обновляются отдельно от расширения.',
  },
  fish: {
    en: 'Statistics in Windows 8.0 breaks requests down by company, app, and domain.',
    ru: 'Статистика в Windows 8.0 разбивает запросы по компаниям, приложениям и доменам.',
  },
  dragon: {
    en: 'Version 8.0 filters HTTPS at the level of a path, so one part of a site can load and another can be blocked.',
    ru: 'Версия 8.0 фильтрует HTTPS на уровне пути: одна часть сайта загружается, другая блокируется.',
  },
  crab: {
    en: 'App management in 8.0 lets you send one chosen app through AdGuard and leave the rest alone.',
    ru: 'В 8.0 можно направить выбранную программу через AdGuard, не трогая остальные.',
  },
  cat: {
    en: 'AdGuard Mini 3.0 blocks ads in Samsung Browser and Yandex Browser through the Content Blocking API.',
    ru: 'AdGuard Mini 3.0 блокирует рекламу в Samsung Browser и Яндекс Браузере через Content Blocking API.',
  },
  bunny: {
    en: 'Video browser in AdGuard Mini 3.0 plays YouTube videos without ads.',
    ru: 'Видеобраузер в AdGuard Mini 3.0 показывает видео на YouTube без рекламы.',
  },
  mail: {
    en: 'AdGuard Home v1.0 brought 22 stability improvements and one behavioral change over v0.107.80.',
    ru: 'В AdGuard Home 1.0 по сравнению с 0.107.80 появилось 22 улучшения стабильности и одно изменение поведения.',
  },
  umbrella: {
    en: 'Browsers make only about 55–60% of desktop traffic, so Windows 8.0 filters every app, not just browsers.',
    ru: 'Через браузеры проходит лишь около 55–60% трафика компьютера, поэтому Windows 8.0 фильтрует все программы, а не только браузеры.',
  },
};

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
  bird: {
    en: 'Version 5.4 can share all extension settings as a link, handy after a browser reinstall.',
    ru: 'В версии 5.4 все настройки расширения можно передать ссылкой — удобно после переустановки браузера.',
  },
  fox: {
    en: 'Meta Quest Browser supports around 10 extensions, and AdGuard is one of the first ad blockers there.',
    ru: 'В браузере Meta Quest поддерживается около 10 расширений, и AdGuard — один из первых блокировщиков среди них.',
  },
  hedgehog: {
    en: 'AdGuard works in Meta Quest Browser on Quest 2, Quest Pro, Quest 3, and Quest 3S.',
    ru: 'AdGuard работает в браузере Meta Quest на Quest 2, Quest Pro, Quest 3 и Quest 3S.',
  },
  frog: {
    en: 'In version 5.4, custom filters in MV3 can update separately from the extension again.',
    ru: 'В версии 5.4 собственные фильтры в MV3 снова обновляются отдельно от расширения.',
  },
  fish: {
    en: 'Statistics in Windows 8.0 breaks requests down by company, app, and domain.',
    ru: 'Статистика в Windows 8.0 разбивает запросы по компаниям, приложениям и доменам.',
  },
  crab: {
    en: 'Version 8.0 filters HTTPS at the level of a path, so one part of a site can load and another can be blocked.',
    ru: 'Версия 8.0 фильтрует HTTPS на уровне пути: одна часть сайта загружается, другая блокируется.',
  },
  squirrel: {
    en: 'AdGuard Mini 3.0 blocks ads in Samsung Browser and Yandex Browser through the Content Blocking API.',
    ru: 'AdGuard Mini 3.0 блокирует рекламу в Samsung Browser и Яндекс Браузере через Content Blocking API.',
  },
  bunny: {
    en: 'Video browser in AdGuard Mini 3.0 plays YouTube videos without ads.',
    ru: 'Видеобраузер в AdGuard Mini 3.0 показывает видео на YouTube без рекламы.',
  },
  cat: {
    en: 'AdGuard Home v1.0 brought 22 stability improvements and one behavioral change over v0.107.80.',
    ru: 'В AdGuard Home 1.0 по сравнению с 0.107.80 появилось 22 улучшения стабильности и одно изменение поведения.',
  },
  owl: {
    en: 'AdGuard Home began as a prototype in 2018 and reached its first stable release with version 1.0.',
    ru: 'AdGuard Home начался с прототипа в 2018 году, а версия 1.0 стала первым стабильным выпуском.',
  },
};

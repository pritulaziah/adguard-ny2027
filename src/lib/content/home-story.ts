import { derived, writable } from 'svelte/store';
import { language } from './i18n';

export const homeStoryOpen = writable(false);
export const openHomeStory = () => homeStoryOpen.set(true);

const translations = {
  en: {
    open: 'Explore the story', close: 'Close the story', label: 'AdGuard Home 1.0 story',
    eyebrow: 'STORY 01 · ADGUARD HOME', title: 'Eight years. A new chapter.',
    lead: 'From the first preview in 2018 to version 1.0 in 2026 — a familiar home for your network, rebuilt for what comes next.',
    first: 'First public preview', now: 'Version 1.0',
    heading: 'A fresh interface. The same familiar logic.',
    body: 'The interface was rebuilt from the ground up, with lower memory use and a layout that works on phones and desktops. The sections remain familiar, so there is less to relearn.',
    detail: 'Client settings, the query log, and filters gained more control and clearer information. Existing configurations and data continue to work with version 1.0.',
    before: 'BEFORE', beforeTitle: 'Where we started this update',
    after: 'AFTER', afterTitle: 'The new AdGuard Home',
    beforeAlt: 'Actual screenshot of the AdGuard Home dashboard before the redesign',
    afterAlt: 'Actual screenshot of the redesigned AdGuard Home 1.0 dashboard',
    source: 'Original screenshots from the AdGuard Home beta announcement',
    read: 'Read the full release story', footer: 'Built with the community. Ready for the next chapter.',
  },
  ru: {
    open: 'Посмотреть историю', close: 'Закрыть историю', label: 'История AdGuard Home 1.0',
    eyebrow: 'ИСТОРИЯ 01 · ADGUARD HOME', title: 'Восемь лет. Новая глава.',
    lead: 'От первого прототипа в 2018 году до версии 1.0 в 2026-м — привычный дом для вашей сети, готовый к дальнейшему развитию.',
    first: 'Первый публичный прототип', now: 'Версия 1.0',
    heading: 'Новый интерфейс. Знакомая логика.',
    body: 'Интерфейс переработали с нуля: снизили потребление памяти и адаптировали страницы для телефонов и компьютеров. Привычные разделы сохранились, поэтому осваивать всё заново не придётся.',
    detail: 'Настройки клиентов, журнал запросов и фильтры получили больше возможностей и наглядности. Существующие настройки и данные продолжают работать в версии 1.0.',
    before: 'ДО', beforeTitle: 'С чего начиналось это обновление',
    after: 'ПОСЛЕ', afterTitle: 'Новый AdGuard Home',
    beforeAlt: 'Настоящий скриншот панели AdGuard Home до обновления интерфейса',
    afterAlt: 'Настоящий скриншот обновлённой панели AdGuard Home 1.0',
    source: 'Оригинальные скриншоты из анонса бета-версии AdGuard Home',
    read: 'Читать статью о релизе целиком', footer: 'Создан вместе с сообществом. Готов к новой главе.',
  },
};

export const homeStoryCopy = derived(language, value => translations[value]);

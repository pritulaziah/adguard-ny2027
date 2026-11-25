import { derived, writable } from 'svelte/store';
import { language } from './i18n';

export interface FactPosition { x: number; y: number; width: number; height: number }
export const snowmanFact = writable<FactPosition | null>(null);
export const snowmanFactCopy = derived(language, value => value === 'ru' ? {
  title: 'А вы знали?', close: 'Закрыть реплику', source: 'Из истории проекта',
  text: 'Первый интерфейс AdGuard Home написал человек, который тогда только учился React. Из этого прототипа вырос проект, дошедший до версии 1.0.',
} : {
  title: 'Did you know?', close: 'Close the note', source: 'From the project’s history',
  text: 'AdGuard Home’s first interface was built by someone who was still learning React. That early prototype grew into the project that reached version 1.0.',
});

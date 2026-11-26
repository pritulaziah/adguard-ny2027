import { expect, test } from 'vitest';
import {
  articles,
  articlesByLanguage,
  findHomeArticle,
  homeStoryStop,
} from './articles.ts';
import { translations } from './i18n.ts';

const routeOrder = ['ios-pqc', 'quest', 'extension', 'windows', 'mini-android', 'home'];

test('the year holds six stories in route order', () => {
  expect(articles.length).toBe(6);
  expect(articles.map(article => article.id)).toEqual(routeOrder);
});

test('every story carries a unique complete record', () => {
  for (const language of ['ru', 'en']) {
    const list = articlesByLanguage[language];
    expect(new Set(list.map(article => article.id)).size).toBe(list.length);
    for (const article of list) {
      for (const field of ['id', 'station', 'title', 'summary', 'stat', 'statLabel', 'hiddenFact', 'image', 'imageAlt', 'color']) {
        expect(typeof article[field], `${language} ${article.id}.${field} is a string`).toBe('string');
        expect(article[field].length, `${language} ${article.id}.${field} is not empty`).toBeGreaterThan(0);
      }
      expect(article.facts.length, `${language} ${article.id} has two facts`).toBe(2);
      for (const fact of article.facts) {
        expect(typeof fact, `${language} ${article.id} fact is a string`).toBe('string');
        expect(fact.length, `${language} ${article.id} fact is not empty`).toBeGreaterThan(0);
      }
    }
  }
});

test('the home story is the last story on the route', () => {
  expect(articles.findIndex(article => article.id === 'home')).toBe(5);
  expect(homeStoryStop).toBe(6);
});

test('the home article is found by id in both languages', () => {
  expect(findHomeArticle('ru')?.id).toBe('home');
  expect(findHomeArticle('en')?.id).toBe('home');
  expect(findHomeArticle('ru')?.link).toBe('https://adguard.com/ru/blog/adguard-home-v1-0.html');
  expect(findHomeArticle('en')?.link).toBe('https://adguard.com/en/blog/adguard-home-v-1-0.html');
});

test('both languages cover every story', () => {
  expect(articlesByLanguage.ru.length).toBe(6);
  expect(articlesByLanguage.en.length).toBe(6);
  expect(articlesByLanguage.ru.map(article => article.id)).toEqual(routeOrder);
  expect(articlesByLanguage.en.map(article => article.id)).toEqual(routeOrder);
});

test('english release links use the english blog prefix', () => {
  for (const article of articlesByLanguage.ru) {
    expect(article.link.startsWith('https://adguard.com/ru/blog/'), `${article.id} RU link`).toBe(true);
  }
  for (const article of articlesByLanguage.en) {
    expect(article.link.startsWith('https://adguard.com/en/blog/'), `${article.id} EN link`).toBe(true);
    expect(article.link.includes('/ru/blog/'), `${article.id} EN link keeps no RU prefix`).toBe(false);
  }
});

test('release links follow the blog address of each language', () => {
  for (let index = 0; index < routeOrder.length; index++) {
    const id = routeOrder[index];
    const ru = new URL(articlesByLanguage.ru[index].link);
    const en = new URL(articlesByLanguage.en[index].link);
    expect(ru.host, `${id} RU host`).toBe('adguard.com');
    expect(en.host, `${id} EN host`).toBe('adguard.com');
    const ruParts = ru.pathname.split('/');
    const enParts = en.pathname.split('/');
    expect(ruParts.slice(0, 3), `${id} RU path`).toEqual(['', 'ru', 'blog']);
    expect(enParts.slice(0, 3), `${id} EN path`).toEqual(['', 'en', 'blog']);
    if (id === 'home') {
      expect(ruParts[3], 'RU Home post address').toBe('adguard-home-v1-0.html');
      expect(enParts[3], 'EN Home post address').toBe('adguard-home-v-1-0.html');
    } else {
      expect(ruParts[3], `${id} uses the same post address in both blogs`).toBe(enParts[3]);
    }
  }
});

test('the welcome copy counts six stories', () => {
  expect(translations.en.welcomeSummary.includes('Six stories')).toBe(true);
  expect(translations.ru.welcomeSummary.includes('Шесть историй')).toBe(true);
});

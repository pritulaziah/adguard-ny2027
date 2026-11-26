import test from 'node:test';
import assert from 'node:assert/strict';
import {
  articles,
  articlesByLanguage,
  findHomeArticle,
  homeStoryStop,
} from './articles.ts';
import { translations } from './i18n.ts';

const routeOrder = ['ios-pqc', 'quest', 'extension', 'windows', 'mini-android', 'home'];

test('the year holds six stories in route order', () => {
  assert.equal(articles.length, 6);
  assert.deepEqual(articles.map(article => article.id), routeOrder);
});

test('every story carries a unique complete record', () => {
  for (const language of ['ru', 'en']) {
    const list = articlesByLanguage[language];
    assert.equal(new Set(list.map(article => article.id)).size, list.length);
    for (const article of list) {
      for (const field of ['id', 'station', 'title', 'summary', 'stat', 'statLabel', 'hiddenFact', 'image', 'imageAlt', 'color']) {
        assert.equal(typeof article[field], 'string', `${language} ${article.id}.${field} is a string`);
        assert.ok(article[field].length > 0, `${language} ${article.id}.${field} is not empty`);
      }
      assert.equal(article.facts.length, 2, `${language} ${article.id} has two facts`);
      for (const fact of article.facts) {
        assert.equal(typeof fact, 'string', `${language} ${article.id} fact is a string`);
        assert.ok(fact.length > 0, `${language} ${article.id} fact is not empty`);
      }
    }
  }
});

test('the home story is the last story on the route', () => {
  assert.equal(articles.findIndex(article => article.id === 'home'), 5);
  assert.equal(homeStoryStop, 6);
});

test('the home article is found by id in both languages', () => {
  assert.equal(findHomeArticle('ru')?.id, 'home');
  assert.equal(findHomeArticle('en')?.id, 'home');
  assert.equal(findHomeArticle('ru')?.link, 'https://adguard.com/ru/blog/adguard-home-v1-0.html');
  assert.equal(findHomeArticle('en')?.link, 'https://adguard.com/en/blog/adguard-home-v-1-0.html');
});

test('both languages cover every story', () => {
  assert.equal(articlesByLanguage.ru.length, 6);
  assert.equal(articlesByLanguage.en.length, 6);
  assert.deepEqual(articlesByLanguage.ru.map(article => article.id), routeOrder);
  assert.deepEqual(articlesByLanguage.en.map(article => article.id), routeOrder);
});

test('english release links use the english blog prefix', () => {
  for (const article of articlesByLanguage.ru) {
    assert.ok(article.link.startsWith('https://adguard.com/ru/blog/'), `${article.id} RU link`);
  }
  for (const article of articlesByLanguage.en) {
    assert.ok(article.link.startsWith('https://adguard.com/en/blog/'), `${article.id} EN link`);
    assert.ok(!article.link.includes('/ru/blog/'), `${article.id} EN link keeps no RU prefix`);
  }
});

test('release links follow the blog address of each language', () => {
  for (let index = 0; index < routeOrder.length; index++) {
    const id = routeOrder[index];
    const ru = new URL(articlesByLanguage.ru[index].link);
    const en = new URL(articlesByLanguage.en[index].link);
    assert.equal(ru.host, 'adguard.com', `${id} RU host`);
    assert.equal(en.host, 'adguard.com', `${id} EN host`);
    const ruParts = ru.pathname.split('/');
    const enParts = en.pathname.split('/');
    assert.deepEqual(ruParts.slice(0, 3), ['', 'ru', 'blog'], `${id} RU path`);
    assert.deepEqual(enParts.slice(0, 3), ['', 'en', 'blog'], `${id} EN path`);
    if (id === 'home') {
      assert.equal(ruParts[3], 'adguard-home-v1-0.html', 'RU Home post address');
      assert.equal(enParts[3], 'adguard-home-v-1-0.html', 'EN Home post address');
    } else {
      assert.equal(ruParts[3], enParts[3], `${id} uses the same post address in both blogs`);
    }
  }
});

test('the welcome copy counts six stories', () => {
  assert.ok(translations.en.welcomeSummary.includes('Six stories'));
  assert.ok(translations.ru.welcomeSummary.includes('Шесть историй'));
});

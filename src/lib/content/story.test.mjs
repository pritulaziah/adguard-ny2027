import { expect, test } from 'vitest';
import { deepDives } from './story-deep-dive.ts';
import { figureFacts } from './figure-facts.ts';
import { storyProducts } from './story-modal.ts';

const storyIds = ['ios-pqc', 'quest', 'extension', 'windows', 'mini-android', 'home'];
const interactionKeys = [
  'deer',
  'snowman',
  'fox',
  'hedgehog',
  'bird',
  'frog',
  'duck',
  'beaver',
  'bunny',
  'squirrel',
  'cat',
  'owl',
];

test('every story has a deep dive in both languages', () => {
  expect(Object.keys(deepDives).sort()).toEqual([...storyIds].sort());
  for (const id of storyIds) {
    for (const language of ['ru', 'en']) {
      const story = deepDives[id][language];
      expect(story, `${id} ${language} exists`).toBeTruthy();
      expect(story.lead.length, `${id} ${language} lead`).toBeGreaterThan(20);
      expect(story.afterword.length, `${id} ${language} afterword`).toBeGreaterThan(10);
      for (const field of ['from', 'fromLabel', 'to', 'toLabel']) {
        expect(story.timeline[field].length, `${id} ${language} timeline ${field}`).toBeGreaterThan(0);
      }
      expect(story.passages.length, `${id} ${language} has passages`).toBeGreaterThanOrEqual(2);
      for (const passage of story.passages) {
        expect(passage.heading.length, `${id} ${language} passage heading`).toBeGreaterThan(0);
        expect(passage.body.length, `${id} ${language} passage body`).toBeGreaterThan(30);
      }
    }
  }
});

test('only the home story shows screenshots', () => {
  for (const id of storyIds) {
    for (const language of ['ru', 'en']) {
      const shots = deepDives[id][language].shots;
      if (id !== 'home') {
        expect(shots, `${id} ${language} has no screenshots`).toBeUndefined();
        continue;
      }
      expect(shots?.length, 'home has two screenshots').toBe(2);
      for (const shot of shots ?? []) {
        expect(shot.image.includes('blog/home/'), 'home screenshots come from the home folder').toBe(true);
        expect(shot.label.length > 0 && shot.title.length > 0 && shot.alt.length > 0, 'home screenshot copy').toBe(
          true,
        );
      }
    }
  }
});

test('every product has a name in both languages', () => {
  expect(Object.keys(storyProducts).sort()).toEqual([...storyIds].sort());
  for (const id of storyIds) {
    expect(storyProducts[id].en.length, `${id} en product`).toBeGreaterThan(0);
    expect(storyProducts[id].ru.length, `${id} ru product`).toBeGreaterThan(0);
  }
});

test('every figure carries its own fact in both languages', () => {
  expect(Object.keys(figureFacts).sort()).toEqual([...interactionKeys].sort());
  for (const key of interactionKeys) {
    for (const language of ['ru', 'en']) {
      const fact = figureFacts[key][language];
      expect(typeof fact, `${key} ${language} is a string`).toBe('string');
      expect(fact.length, `${key} ${language} is a sentence`).toBeGreaterThan(20);
    }
  }
});

test('facts at one stop differ from each other', () => {
  const stops = [
    ['deer'],
    ['snowman'],
    ['fox', 'hedgehog'],
    ['bird', 'frog'],
    ['duck', 'beaver'],
    ['bunny', 'squirrel'],
    ['cat', 'owl'],
  ];
  for (const stop of stops) {
    for (const language of ['ru', 'en']) {
      const texts = stop.map(key => figureFacts[key][language]);
      expect(new Set(texts).size, `${stop.join(', ')} ${language} facts differ`).toBe(texts.length);
    }
  }
});

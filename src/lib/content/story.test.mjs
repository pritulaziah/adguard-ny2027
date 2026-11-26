import test from 'node:test';
import assert from 'node:assert/strict';
import { deepDives } from './story-deep-dive.ts';
import { figureFacts } from './figure-facts.ts';
import { storyProducts } from './story-modal.ts';

const storyIds = ['ios-pqc', 'quest', 'extension', 'windows', 'mini-android', 'home'];
const interactionKeys = ['deer', 'snowman', 'gate', 'fox', 'frog', 'fish', 'dragon', 'crab', 'cat', 'bunny', 'mail', 'lighthouse'];

test('every story has a deep dive in both languages', () => {
  assert.deepEqual(Object.keys(deepDives).sort(), [...storyIds].sort());
  for (const id of storyIds) {
    for (const language of ['ru', 'en']) {
      const story = deepDives[id][language];
      assert.ok(story, `${id} ${language} exists`);
      assert.ok(story.lead.length > 20, `${id} ${language} lead`);
      assert.ok(story.afterword.length > 10, `${id} ${language} afterword`);
      for (const field of ['from', 'fromLabel', 'to', 'toLabel']) {
        assert.ok(story.timeline[field].length > 0, `${id} ${language} timeline ${field}`);
      }
      assert.ok(story.passages.length >= 2, `${id} ${language} has passages`);
      for (const passage of story.passages) {
        assert.ok(passage.heading.length > 0, `${id} ${language} passage heading`);
        assert.ok(passage.body.length > 30, `${id} ${language} passage body`);
      }
    }
  }
});

test('only the home story shows screenshots', () => {
  for (const id of storyIds) {
    for (const language of ['ru', 'en']) {
      const shots = deepDives[id][language].shots;
      if (id !== 'home') {
        assert.equal(shots, undefined, `${id} ${language} has no screenshots`);
        continue;
      }
      assert.equal(shots?.length, 2, 'home has two screenshots');
      for (const shot of shots ?? []) {
        assert.ok(shot.image.includes('blog/home/'), 'home screenshots come from the home folder');
        assert.ok(shot.label.length > 0 && shot.title.length > 0 && shot.alt.length > 0, 'home screenshot copy');
      }
    }
  }
});

test('every product has a name in both languages', () => {
  assert.deepEqual(Object.keys(storyProducts).sort(), [...storyIds].sort());
  for (const id of storyIds) {
    assert.ok(storyProducts[id].en.length > 0, `${id} en product`);
    assert.ok(storyProducts[id].ru.length > 0, `${id} ru product`);
  }
});

test('every figure carries its own fact in both languages', () => {
  assert.deepEqual(Object.keys(figureFacts).sort(), [...interactionKeys].sort());
  for (const key of interactionKeys) {
    for (const language of ['ru', 'en']) {
      const fact = figureFacts[key][language];
      assert.equal(typeof fact, 'string', `${key} ${language} is a string`);
      assert.ok(fact.length > 20, `${key} ${language} is a sentence`);
    }
  }
});

test('facts at one stop differ from each other', () => {
  const stops = [
    ['deer'],
    ['snowman'],
    ['frog', 'gate'],
    ['dragon', 'crab', 'fish', 'lighthouse'],
    ['cat', 'bunny'],
    ['mail'],
  ];
  for (const stop of stops) {
    for (const language of ['ru', 'en']) {
      const texts = stop.map(key => figureFacts[key][language]);
      assert.equal(new Set(texts).size, texts.length, `${stop.join(', ')} ${language} facts differ`);
    }
  }
});

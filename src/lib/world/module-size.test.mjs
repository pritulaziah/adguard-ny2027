import { expect, test } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The scene is split by object. Keep each object module small enough to read
// in one pass, so the split does not drift back into a few large files.
const LIMIT = 300;
const root = fileURLToPath(new URL('.', import.meta.url));

function filesIn(directory) {
  const files = [];
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) files.push(...filesIn(path));
    else if (name.endsWith('.ts')) files.push(path);
  }
  return files;
}

test('each world object module stays small', () => {
  const files = [
    ...filesIn(join(root, 'scenery')),
    ...filesIn(join(root, 'vehicles')),
    ...filesIn(join(root, 'year')),
    join(root, 'YearWorld.ts'),
  ];

  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n').length;
    expect(lines, file.replace(root, '')).toBeLessThanOrEqual(LIMIT);
  }
});

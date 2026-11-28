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
    // Every world module counts, including the modules at the world root.
    // Only the test file in `year/` is not a production module.
    else if (name.endsWith('.ts') && !name.endsWith('.test.ts')) files.push(path);
  }
  return files;
}

test('each world object module stays small', () => {
  const files = filesIn(root);

  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n').length;
    expect(lines, file.replace(root, '')).toBeLessThanOrEqual(LIMIT);
  }
});

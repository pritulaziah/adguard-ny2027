import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const publicDir = fileURLToPath(new URL('../../../public/', import.meta.url));
/** The scene loads every portrait before the first frame. Keep each image small. */
const MAX_IMAGE_BYTES = 300 * 1024;

function publicFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? publicFiles(full) : [full];
  });
}

const files = publicFiles(publicDir);
const raster = files.filter(file => /\.(png|jpe?g|webp|avif|gif)$/i.test(file));

test('raster art is WebP or JPEG, not PNG', () => {
  for (const file of files) {
    expect(file.endsWith('.png'), `${file.slice(publicDir.length)} is PNG`).toBe(false);
  }
});

test('every public image stays under 300 KB', () => {
  for (const file of raster) {
    const size = statSync(file).size;
    expect(size, `${file.slice(publicDir.length)} weighs ${Math.round(size / 1024)} KB`).toBeLessThanOrEqual(
      MAX_IMAGE_BYTES,
    );
  }
});

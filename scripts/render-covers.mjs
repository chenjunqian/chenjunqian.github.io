// Rasterises the SVG covers into social-card PNGs (SVG is not valid for og:image).
import sharp from 'sharp';
import { join } from 'node:path';

const dir = join(process.cwd(), 'public', 'images', 'covers');
for (const name of ['hello', 'trend-catcher', 'movtrak']) {
  await sharp(join(dir, `${name}.svg`), { density: 96 })
    .resize(1600, 900)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(join(dir, `${name}-og.png`));
}
console.log('covers rendered');

import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(here, '..', 'static', 'icons');

const baseSvg = await readFile(join(iconsDir, 'icon.svg'));
const maskableSvg = await readFile(join(iconsDir, 'icon-maskable.svg'));

const targets = [
	{ src: baseSvg, name: 'icon-192.png', size: 192 },
	{ src: baseSvg, name: 'icon-512.png', size: 512 },
	{ src: baseSvg, name: 'apple-touch-icon.png', size: 180 },
	{ src: baseSvg, name: 'favicon-32.png', size: 32 },
	{ src: maskableSvg, name: 'icon-maskable-512.png', size: 512 }
];

for (const t of targets) {
	const out = await sharp(t.src).resize(t.size, t.size).png().toBuffer();
	await writeFile(join(iconsDir, t.name), out);
	console.log(`generated ${t.name} ${t.size}x${t.size} (${out.length} bytes)`);
}

console.log('icons done');

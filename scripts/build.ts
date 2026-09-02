import { $ } from 'bun';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import pkg from '../package.json' with { type: 'json' };

const { name, description, version, author, license, homepage } = pkg;
const year = new Date().getFullYear();
const isProduction = process.env.NODE_ENV === 'production';

const banner = `/**
 * ${name} v${version}
 * ${description || 'No description provided.'}
 *
 * @author    ${author.name} <${author.email}>
 * @license   ${license?.toUpperCase()}
 * @copyright ${year} ${author.name}
 * @see       ${homepage}
 *
 * Inspired by currency.js — {@link https://github.com/scurker/currency.js}
 */`;

console.log('🧹 Cleaning dist folder...');
await $`rm -rf dist`;

console.log('📦 Building JavaScript with Bun...');
const buildResult = await Bun.build({
  entrypoints: ['./src/index.ts', './src/presets.ts', './src/calc.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'node',
  minify: isProduction,
  splitting: true,
  banner,
});

if (!buildResult.success) {
  console.error('❌ Build failed:');
  for (const message of buildResult.logs) {
    console.error(message);
  }
  process.exit(1);
}

console.log('🏷️  Generating TypeScript definitions...');
await $`tsc -p tsconfig.build.json`;

console.log('📝 Adding banners to D.TS files...');
const files = await readdir('./dist');
for (const file of files) {
  if (file.endsWith('.d.ts')) {
    const filePath = join('./dist', file);
    const content = await Bun.file(filePath).text();
    await Bun.write(filePath, `${banner}\n${content}`);
  }
}

console.log('✅ Build complete!');

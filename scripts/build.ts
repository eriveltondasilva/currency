// biome-ignore-all: build ignore

import { $ } from 'bun';

import pkg from '../package.json';

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

async function main() {
  console.info('\n🧹 Cleaning dist folder...');
  await $`rm -rf dist`;

  console.info('\n📦 Building JavaScript with Bun...');
  const buildResult = await Bun.build({
    entrypoints: ['./src/index.ts', './src/presets.ts', './src/collection.ts'],
    outdir: './dist',
    format: 'esm',
    target: 'node',
    minify: isProduction,
    splitting: true,
    banner,
  });

  if (!buildResult.success) {
    throw new Error(
      `JavaScript bundling failed:\n${buildResult.logs.map(String).join('\n')}`,
    );
  }

  console.info('🏷️  Generating TypeScript definitions...');
  await $`tsc -p tsconfig.build.json`;

  console.info('\n✅ Build complete!');
}

main().catch((error) => {
  console.error('❌ Build failed:');
  console.error(Error.isError(error) ? error.message : error);

  process.exit(1);
});

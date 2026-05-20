import { defineConfig } from 'tsup';

import pkg from './package.json';

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
 */
`;

export default defineConfig([
  {
    entry: ['./src/index.ts', './src/presets.ts'],
    tsconfig: './tsconfig.build.json',
    banner: { js: banner },
    dts: { banner },
    format: 'esm',
    target: 'esnext',
    treeshake: true,
    splitting: true,
    clean: true,
    sourcemap: !isProduction,
    minify: isProduction,
  },
]);

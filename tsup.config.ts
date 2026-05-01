import { defineConfig } from 'tsup';

import pkg from './package.json';

const { name, description, version, author, license, homepage } = pkg;
const year = new Date().getFullYear();

const isProduction = process.env.NODE_ENV === 'production';

const banner = `/**
 * ${name?.toUpperCase()} v${version}
 *
 * ${description || 'no description'}
 *
 * @author ${author.name} <${author.email}>
 * @license ${license?.toUpperCase()}
 * @copyright ${year} ${author.name}
 * @version ${version}
 *
 * @see ${homepage} - Documentation
 *
 * Inspired by:
 * @see https://github.com/scurker/currency.js
 */
`;

export default defineConfig([
  {
    entry: ['./src/index.ts'],
    tsconfig: './tsconfig.build.json',
    banner: { js: banner },
    dts: { banner },
    format: 'esm',
    treeshake: true,
    clean: true,
    sourcemap: !isProduction,
    minify: isProduction,
  },
]);

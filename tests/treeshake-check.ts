/** biome-ignore-all lint/suspicious/noConsole: test file */
import { from } from '@/index';

console.log(from(10, 'US').format());

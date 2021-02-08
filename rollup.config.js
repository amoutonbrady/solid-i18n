// @ts-check
import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const extensions = ['.tsx', '.ts'];

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/solid-i18n.tsx',
  external: ['solid-js', 'solid-js/web'],
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
      extensions,
      browser: true,
    }),
    babel({
      extensions,
      babelHelpers: 'bundled',
      presets: ['babel-preset-solid', '@babel/preset-typescript'],
    }),
  ],
};

export default config;

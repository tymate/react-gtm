import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    babel({ babelHelpers: 'runtime', skipPreflightCheck: true }),
    nodeResolve(),
    commonjs(),
  ],
  external: ['react', 'react-helmet'],
};

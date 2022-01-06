import typescript from '@rollup/plugin-typescript';
import run from '@rollup/plugin-run';

const isWatch = process.argv.includes('-w');

export default {
  input: './src/main.ts',
  output: {
    dir: './dist',
    format: 'es'
  },
  plugins: [
    typescript(),
    isWatch && run(/*{
      options: {
        execArgv: ['--inspect']
      }
    }*/),
  ]
};

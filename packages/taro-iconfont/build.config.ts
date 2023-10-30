import { copy } from 'fs-extra';
import path from 'path';
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  outDir: 'lib',
  hooks: {
    'build:done': async context => {
      copy(path.resolve(__dirname, './src/templates'), path.resolve(__dirname, './lib/templates'));
      copy(
        path.resolve(__dirname, './src/iconfont.json'),
        path.resolve(__dirname, './lib/iconfont.json'),
      );
    },
  },
});

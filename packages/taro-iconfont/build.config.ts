import { copy } from 'fs-extra';
import path from 'path';
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  clean: true,
  hooks: {
    'build:done': async context => {
      copy(path.resolve(__dirname, './src/templates'), path.resolve(__dirname, './dist/templates'));
      copy(
        path.resolve(__dirname, './src/iconfont.json'),
        path.resolve(__dirname, './dist/iconfont.json'),
      );
    },
  },
});

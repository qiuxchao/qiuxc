import { copy } from 'fs-extra';
import path from 'path';
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index', 'src/cli'],
  outDir: 'lib',
  declaration: true,
  clean: true,
  failOnWarn: false,
  rollup: {
    inlineDependencies: true,
    emitCJS: true,
    cjsBridge: true,
  },
  hooks: {
    'build:done': async context => {
      copy(
        path.resolve(__dirname, 'src/config.template'),
        path.resolve(__dirname, 'lib/config.template'),
      );
    },
  },
});

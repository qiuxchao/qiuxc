# My MonoRepo Project

## What's inside?

This MonoRepo Project includes the following:

### Apps and Packages

- `docs`: A placeholder documentation site powered by [Next.js](https://nextjs.org/)
- `@qiuxc/rc`: React components
- `@qiuxc/utils`: shared some utilities
- `@qiuxc/tsconfig`: shared `tsconfig.json`s used throughout the monorepo
- `@qiuxc/eslint-config`: ESLint preset
- `@qiuxc/eslint-plugin`: ESLint plugin

### Commands

- `pnpm build` - Build all packages and the docs site
- `pnpm dev` - Develop all packages and the docs site
- `pnpm lint` - Lint all packages
- `pnpm changeset` - Generate a changeset
- `pnpm clean` - Clean up all `node_modules` and `dist` folders (runs each package's clean script)

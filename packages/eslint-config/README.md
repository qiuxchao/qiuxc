# [eslint-config-qiuxc][网站]

> 本项目 fork 自 [eslint-config-alloy](https://github.com/AlloyTeam/eslint-config-alloy.git)

ESLint 规则不仅是一套先进的适用于 React/Vue/Typescript 项目的 ESLint 配置规范，而且也是你配置个性化 ESLint 规则的最佳参考。

## 快速开始

请根据你的项目使用的技术栈选择以下配置：

- [内置规则](#内置规则)
- [React](#react)
- [Vue](#vue)
- [TypeScript](#typescript)
- [TypeScript React](#typescript-react)
- [TypeScript Vue](#typescript-vue)

## 设计理念

- 样式相关的规则交给 [Prettier][] 管理
- 传承 ESLint 的理念，帮助大家建立自己的规则
- 高度的自动化：先进的规则管理，测试即文档即[网站][]
- 与时俱进，第一时间跟进最新的规则

## 使用方法

### 内置规则

```bash
npm install --save-dev eslint @babel/core @babel/eslint-parser @qiuxc/eslint-config
```

在你的项目的根目录下创建一个 `.eslintrc.js` 文件，并将以下内容复制进去：

```js
module.exports = {
  extends: ['qiuxc'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```

### React

```bash
npm install --save-dev eslint @babel/core @babel/eslint-parser @babel/preset-react@latest eslint-plugin-react @qiuxc/eslint-config
```

在你的项目的根目录下创建一个 `.eslintrc.js` 文件，并将以下内容复制进去：

```js
module.exports = {
  extends: ['qiuxc', 'qiuxc/react'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```

### Vue

```bash
npm install --save-dev eslint @babel/core @babel/eslint-parser vue-eslint-parser eslint-plugin-vue @qiuxc/eslint-config
```

在你的项目的根目录下创建一个 `.eslintrc.js` 文件，并将以下内容复制进去：

```js
module.exports = {
  extends: ['qiuxc', 'qiuxc/vue'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```

### TypeScript

```bash
npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin @qiuxc/eslint-config
```

在你的项目的根目录下创建一个 `.eslintrc.js` 文件，并将以下内容复制进去：

```js
module.exports = {
  extends: ['qiuxc', 'qiuxc/typescript'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```

### TypeScript React

```bash
npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react @qiuxc/eslint-config
```

在你的项目的根目录下创建一个 `.eslintrc.js` 文件，并将以下内容复制进去：

```js
module.exports = {
  extends: ['qiuxc', 'qiuxc/react', 'qiuxc/typescript'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```

### TypeScript Vue

建议使用 `npm init vue@3` 创建集成了 Vue, TypeScript 和 ESLint 的项目，然后再参考[此示例](./examples/typescript-vue/.eslintrc.js)调整其 ESLint 配置。

常规方法如下：

```bash
npm install --save-dev @babel/core @babel/eslint-parser @typescript-eslint/eslint-plugin @typescript-eslint/parser @vue/eslint-config-typescript eslint @qiuxc/eslint-config eslint-plugin-vue vue-eslint-parser
```

在你的项目的根目录下创建一个 `.eslintrc.js` 文件，并将以下内容复制进去：

```js
module.exports = {
  extends: ['qiuxc', 'qiuxc/vue', 'qiuxc/typescript'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: {
      js: '@babel/eslint-parser',
      jsx: '@babel/eslint-parser',

      ts: '@typescript-eslint/parser',
      tsx: '@typescript-eslint/parser',

      // Leave the template parser unspecified, so that it could be determined by `<script lang="...">`
    },
  },
  env: {
    // Your environments (which contains several predefined global variables)
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // Your global variables (setting to false means it's not allowed to be reassigned)
    //
    // myGlobal: false
  },
  rules: {
    // Customize your rules
    //
    // Please keep this rule off because it requiresTypeChecking
    // https://github.com/vuejs/vue-eslint-parser/issues/104
    // https://github.com/typescript-eslint/typescript-eslint/pull/5318
    '@typescript-eslint/prefer-optional-chain': 'off',
  },
};
```

## 常见问题

### 在 VSCode 中使用

在 VSCode 中安装 ESLint 扩展即可。

参考[这里](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)可以对扩展进行配置。

### 保存时自动修复 ESLint 错误

如果想要开启「保存时自动修复」的功能，你需要配置 `.vscode/settings.json`：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 如何结合 Prettier 使用

eslint-config-qiuxc 包含所有样式相关的规则，故不需要引入 `eslint-config-prettier`。只需要安装 `prettier` 及相关 VSCode 插件即可。

eslint-config-qiuxc 提供了一套 Prettier 配置，你可以创建一个 `.prettierrc` 文件，直接复用此配置：

```json
"@qiuxc/eslint-config/.prettierrc.js"
```

VSCode 的一个最佳实践就是通过配置 `.vscode/settings.json` 来支持自动修复 Prettier 和 ESLint 错误：

```json
{
  "files.eol": "\n",
  "editor.tabSize": 2,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 常用命令

```bash
# 安装依赖
pnpm i
# 构建 index.js react.js 等 eslintrc 配置
pnpm build
# 执行测试
pnpm test
# 自动修复格式错误
pnpm prettier:fix
# 检查是否覆盖了所有的规则
pnpm rulesCoverage
# 发布新版本
npm version <major|minor|patch>
git push --follow-tags
npm publish
```

[Prettier]: https://prettier.io/
[网站]: https://alloyteam.github.io/eslint-config-alloy/?language=zh-CN
[ESLint 的理念]: https://eslint.org/docs/about/#philosophy

/**
 * qiuxchao 的 ESLint 规则
 * https://github.com/qiuxchao/qiuxc/tree/main/packages/eslint-config
 *
 * 贡献者：
 *   qiuxchao
 *
 *
 * 依赖版本：
 *   eslint ^8.18.0
 *   @babel/core ^7.22.11
 *   @babel/eslint-parser ^7.22.11
 *   @babel/preset-react ^7.22.5
 *   eslint-plugin-react ^7.33.2
 *   vue-eslint-parser ^9.3.1
 *   eslint-plugin-vue ^9.17.0
 *   @typescript-eslint/parser ^6.0.0
 *   @typescript-eslint/eslint-plugin ^6.0.0
 *
 * 此文件是由脚本 scripts/build.ts 自动生成
 */
module.exports = {
  parserOptions: {
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  plugins: ['@qiuxc', 'simple-import-sort'],
  rules: {
    /**
     * jsx中的className 禁止含有多余空格
     */
    '@qiuxc/no-classname-spaces': ['warn', 'never'],
    /**
     * 组件方法必须要有注释说明
     * ignoreHooks 可以忽略一些hooks不用写注释
     */
    '@qiuxc/no-fun-comment': [
      'warn',
      {
        ignoreHooks: ['useForm'],
      },
    ],
    /**
     *
     */
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          ['^react', '^@?\\w'],
          ['^(@|components)(/.*|$)'],
          ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ['^\\u0000'],
          ['^.+\\.?(css)$', '^.+\\.?(scss)$', '^.+\\.?(less)$'],
        ],
      },
    ],
  },
};

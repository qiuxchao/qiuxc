/**
 * qiuxchao 的 ESLint 规则
 * https://github.com/qiuxchao/qiuxc/tree/main/packages/eslint-config
 *
 * 贡献者：
 *   qiuxchao
 *
 *
 * 依赖版本：
 *   eslint latest
 *   @babel/core ^7.21.3
 *   @babel/eslint-parser ^7.19.1
 *   @babel/preset-react ^7.18.6
 *   eslint-plugin-react latest
 *   vue-eslint-parser latest
 *   eslint-plugin-vue latest
 *   @typescript-eslint/parser latest
 *   @typescript-eslint/eslint-plugin latest
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

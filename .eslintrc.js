module.exports = {
	env: {
		node: true,
		browser: true,
		es2021: true,
	},
	// This tells ESLint to load the config from the package `@qiuxc/eslint-config`
	extends: [
		'@qiuxc',
		'@qiuxc/eslint-config/react',
		'@qiuxc/eslint-config/typescript',
		'@qiuxc/eslint-config/custom',
	],
	rules: {},
};

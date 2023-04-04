module.exports = {
	env: {
		node: true,
		browser: true,
		es2021: true,
	},
	// This tells ESLint to load the config from the package `@qiuxc/eslint-config`
	extends: ['@qiuxc', '@qiuxc/react', '@qiuxc/typescript'],
	rules: {},
};

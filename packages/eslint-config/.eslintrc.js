module.exports = {
	env: {
		node: true,
		browser: true,
		es2021: true,
	},
	extends: ['./index.js', './react.js', './typescript.js', './custom.js'],
	globals: {
		Prism: false,
	},
};

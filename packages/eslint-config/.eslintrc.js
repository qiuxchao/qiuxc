module.exports = {
	env: {
		node: true,
		browser: true,
		es2021: true,
	},
	extends: ['./index.js', './react.js', './typescript.js'],
	globals: {
		Prism: false,
	},
};

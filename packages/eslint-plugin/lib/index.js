const requireIndex = require('requireindex');
const packageJson = require('../package.json');

module.exports = {
	meta: {
		name: packageJson.name,
		version: packageJson.version,
	},
	rules: requireIndex(__dirname + '/rules'),
};

module.exports = {
  extends: ['../base/.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'react/sort-comp': 'off',
  },
};

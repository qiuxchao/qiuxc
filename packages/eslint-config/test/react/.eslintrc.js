module.exports = {
  extends: ['../base/.eslintrc.js'],
  parserOptions: {
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  plugins: ['react'],
  settings: {
    react: {
      version: 'detect',
    },
  },
};

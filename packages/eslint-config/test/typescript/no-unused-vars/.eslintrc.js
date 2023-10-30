module.exports = {
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        // 忽略 _ 开头的变量
        varsIgnorePattern: '^_',
      },
    ],
  },
};

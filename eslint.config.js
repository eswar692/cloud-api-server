// eslint.config.js
const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...js.configs.recommended,
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    semi: ['error', 'always'],
  },
  extends: ['prettier'],
};


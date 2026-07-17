const expoConfig = require('eslint-config-expo/flat');
const eslint = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  eslint.configs.recommended,
  ...expoConfig,
  prettierConfig,
  {
    ignores: ['.expo/', 'node_modules/', '*.lock', '*.d.ts'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'import/first': 'off',
    },
  },
  {
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-undef': 'off',
      '@typescript-eslint/no-redeclare': 'off',
    },
  },
];

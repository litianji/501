import tsParser from '@typescript-eslint/parser';
import airbnbStyle from 'eslint-config-airbnb-base/rules/style';
import tsElintPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    files: ['**/*.ts', '**/*.js'],
    plugins: {
      tsElintPlugin,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      ...airbnbStyle.rules,
      'no-console': [0],
      'linebreak-style': [0],
      'no-unused-expressions': [0],
      'no-param-reassign': ['error', { props: false }],
      'class-methods-use-this': [0],
      'func-names': ['error', 'never'],
      'no-plusplus': [0],
      'no-mixed-operators': [0],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];

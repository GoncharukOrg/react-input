import { dirname } from 'path';
import { fileURLToPath } from 'url';

import babelParser from '@babel/eslint-parser';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import _import from 'eslint-plugin-import';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import promise from 'eslint-plugin-promise';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['**/node_modules', '**/dist', '**/*.test.ts?(x)', '**/.DS_Store'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:import/recommended',
      'plugin:promise/recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:react-hooks/recommended',
      'plugin:jsx-a11y/strict',
      'plugin:@stylistic/recommended-extends',
      'plugin:prettier/recommended',
    ),
  ),
  {
    plugins: {
      import: fixupPluginRules(_import),
      promise: fixupPluginRules(promise),
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
      'jsx-a11y': fixupPluginRules(jsxA11Y),
      '@stylistic': fixupPluginRules(stylistic),
      prettier: fixupPluginRules(prettier),
    },
    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
      },
      parser: babelParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      'import/parsers': {
        '@babel/eslint-parser': ['.js', '.jsx'],
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: true,
      },
      react: {
        createClass: 'createReactClass',
        pragma: 'React',
        fragment: 'Fragment',
        version: 'detect',
        flowVersion: '0.53',
      },
    },
    rules: {
      eqeqeq: 'error',
      'no-lone-blocks': 'error',
      'no-restricted-imports': [
        'error',
        {
          name: 'react-redux',
          importNames: ['useSelector', 'useDispatch'],
          message: 'Use the `useDispatch` and `useSelector` typed hooks from the `store` directory.',
        },
      ],
      'no-unused-vars': 'off',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'sort-imports': [
        'error',
        {
          ignoreDeclarationSort: true,
        },
      ],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/indent-binary-ops': 'off',
      '@stylistic/jsx-self-closing-comp': 'error',
      '@stylistic/jsx-sort-props': [
        'error',
        {
          reservedFirst: true,
          callbacksLast: true,
        },
      ],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
          multilineDetection: 'brackets',
        },
      ],
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/semi': ['error', 'always'],
      'import/default': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            orderImportKind: 'asc',
          },
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          pathGroups: [
            {
              pattern: '{react,react/**,react-dom,react-dom/**}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '{@react-input,@react-input/**}',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '{errors,errors/**}',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '{hooks,hooks/**}',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '{utils,utils/**}',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '{types,types/**}',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'object', 'type'],
        },
      ],
      'jsx-a11y/no-autofocus': 'off',
      'react/button-has-type': 'error',
      'react/jsx-no-useless-fragment': 'error',
    },
  },
  ...fixupConfigRules(
    compat.extends(
      'plugin:import/typescript',
      'plugin:@typescript-eslint/strict-type-checked',
      'plugin:@typescript-eslint/stylistic-type-checked',
    ),
  ).map((config) => ({ ...config, files: ['**/*.ts?(x)'] })),
  {
    files: ['**/*.ts?(x)'],
    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^React$',
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
        },
      ],
    },
  },
  ...compat.extends('plugin:jest-dom/recommended', 'plugin:testing-library/react').map((config) => ({
    ...config,
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  })),
  ...fixupConfigRules(compat.extends('plugin:storybook/recommended')).map((config) => ({
    ...config,
    files: ['**/stories/**/*.[jt]s?(x)', '**/?(*.)+stories.[jt]s?(x)'],
  })),
];

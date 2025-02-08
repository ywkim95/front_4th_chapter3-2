import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import cypress from 'eslint-plugin-cypress';
import importPlugin from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import security from 'eslint-plugin-security';
import storybook from 'eslint-plugin-storybook';
import unicorn from 'eslint-plugin-unicorn';
import vitest from 'eslint-plugin-vitest';
import globals from 'globals';

export default [
  {
    ignores: ['**/node_modules/**', 'dist/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        Set: true,
        Map: true,
      },
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
      react,
      'react-hooks': reactHooks,
      '@typescript-eslint': typescript,
      import: importPlugin,
      jest,
      security,
      unicorn,
      storybook,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Prettier 통합
      'prettier/prettier': 'error',

      // React
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Import 순서
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', ['parent', 'sibling'], 'index'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],

      // 일반적인 JavaScript/TypeScript 규칙
      'prefer-const': 'error',
      'no-var': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      eqeqeq: ['error', 'always'],
      'no-debugger': 'warn',
      'no-unused-vars': 'off', // TypeScript rule로 대체
      'no-undef': 'off', // TypeScript에서 처리

      // Security
      'security/detect-non-literal-require': 'warn',
      'security/detect-eval-with-expression': 'error',
    },
  },
  {
    files: ['**/*.{spec,test}.[jt]s?(x)', '**/__mocks__/**/*.[jt]s?(x)', '**/setupTests.ts'],
    plugins: {
      vitest,
      jest,
    },
    rules: {
      'vitest/expect-expect': 'off',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
    languageOptions: {
      globals: {
        ...globals.jest,
        vi: true,
        describe: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
      },
    },
  },
  {
    files: ['cypress/e2e/**/*.cy.{js,ts}'],
    plugins: {
      cypress,
    },
    languageOptions: {
      globals: {
        ...globals.cypress,
        cy: true,
      },
    },
  },
  prettier,
];

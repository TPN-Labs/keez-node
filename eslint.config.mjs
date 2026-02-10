import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
    // Global ignores (replaces .eslintignore)
    {
        ignores: ['node_modules/**', 'lib/**', 'coverage/**', 'dist/**'],
    },

    // Base ESLint recommended rules
    eslint.configs.recommended,

    // TypeScript recommended rules
    ...tseslint.configs.recommended,

    // Project-specific configuration
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
            parserOptions: {
                project: true,
            },
        },
        rules: {
            // Spacing and formatting
            'indent': 'off',
            '@typescript-eslint/indent': 'off', // Disabled - using Prettier/WebStorm for formatting
            'object-curly-spacing': ['error', 'always'],
            'object-curly-newline': 'off',
            'padded-blocks': 'off',

            // TypeScript specific
            'no-shadow': 'off',
            '@typescript-eslint/no-shadow': ['error'],
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',

            // Best practices
            'max-len': ['error', { code: 144, ignoreUrls: true }],
            'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
            'class-methods-use-this': 'off',
            'no-underscore-dangle': ['error', { allowAfterThis: true }],

            // Allow certain patterns
            'no-restricted-syntax': 'off',
            'arrow-parens': ['error', 'as-needed'],
            'implicit-arrow-linebreak': 'off',
            'operator-linebreak': 'off',
        },
    },
);

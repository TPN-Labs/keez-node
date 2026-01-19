module.exports = {
    root: true,
    env: {
        node: true,
        es2021: true,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
    rules: {
        // Spacing and formatting
        indent: 'off',
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
};

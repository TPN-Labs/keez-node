module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
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
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never',
            },
        ],
        'arrow-parens': ['error', 'as-needed'],
        'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
        'no-new': 'off',
        'max-len': ['error', { code: 144, ignoreUrls: true }],
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-shadow': 'off',
        indent: ['error', 4],
        'class-methods-use-this': 'off',
        'padded-blocks': 'off',
        'implicit-arrow-linebreak': 'off',
        'import/prefer-default-export': 'off',
        'operator-linebreak': 'off',
        'object-curly-newline': 0,
        'no-underscore-dangle': [2, { allowAfterThis: true }],
        'no-restricted-syntax': 0,
        '@typescript-eslint/no-shadow': ['error'],
        '@typescript-eslint/no-unused-vars': ['error'],
    },
};
module.exports = {
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|/tests/.*|(\\.|/)(test|spec))\\.(t|j)s$',
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};

module.exports = {
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.(t|j)s$',
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};

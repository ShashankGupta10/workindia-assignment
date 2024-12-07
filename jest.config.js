module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files using ts-jest
    },
    transformIgnorePatterns: ['./node_modules'], // Ignore transformation of node_modules
    extensionsToTreatAsEsm: ['.ts'], // Treat TypeScript as ES modules
};
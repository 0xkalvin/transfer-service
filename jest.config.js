module.exports = {
  clearMocks: true,

  collectCoverage: true,

  coverageDirectory: '<rootDir>//reports//coverage',

  coverageReporters: [
    'text',
    'lcov',
    'html',
  ],

  rootDir: '.',

  roots: [
    '<rootDir>/src',
    '<rootDir>/tests',
  ],

  testEnvironment: 'node',

  testMatch: [
    '<rootDir>/**/*.test.js',
  ],

  testPathIgnorePatterns: [
    '/node_modules/',
  ],

};

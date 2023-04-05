const base = require('../jest.config');
module.exports = {
  ...base,
  testMatch: [`**/test/e2e/**/*.{test,spec}.ts`],
  coverageDirectory: '../coverage/e2e',
};
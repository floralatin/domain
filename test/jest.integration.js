const base = require('../jest.config');

module.exports = {
  ...base,
  testMatch: [`**/test/integration/**/*.{test,spec}.ts`],
  coverageDirectory: '../coverage/integration',
};
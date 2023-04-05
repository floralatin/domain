const base = require('../jest.config');
module.exports = {
  ...base,
  testMatch: [`**/test/unit/**/*.{test,spec}.ts`],
  coverageDirectory: '../coverage/unit'
};
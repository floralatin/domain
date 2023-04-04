import { Snowflake } from '../../../src/utils/snowflake';

describe('Utils Snowflake', () => {

  it('Snowflake workId wrong', async () => {
    try {
      new Snowflake(121212n, 12n);
    } catch (error) {
      expect(String(error)).toEqual('Error: Invalid worker ID: 121212');
    }
  });

  it('Snowflake dataCenterId wrong', async () => {
    try {
      new Snowflake(12n, 121212n);
    } catch (error) {
      expect(String(error)).toEqual('Error: Invalid data center ID: 121212');
    }
  });

});
import "reflect-metadata";
import redisService from '../../../src/services/redis.service';

describe('Service: urlService', () => {
  const exKey = 'test:exKey'; 
  const value = 'test123'; 
  const value2 = 'test1234';
  let redisClient: any;

  beforeAll(async()=> {
    redisClient = redisService.getClient();
    await redisService.connect();
  });

  afterAll(async()=> {
    await redisClient.flushDb('SYNC' as any);
    await redisService.disconnect();
  });
    
  it('redisService setEx', async () => {
    const result = await redisService.setEx(exKey, value);
    expect(result).toEqual('OK');

    const getResult = await redisService.get(exKey);
    expect(getResult).toEqual(value);

    const result2 = await redisService.setEx(exKey, value2);
    expect(result2).toEqual('OK');

    const getResult2= await redisService.get(exKey);
    expect(getResult2).toEqual(value2);
  });
  
});
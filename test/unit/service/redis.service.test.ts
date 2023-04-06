import "reflect-metadata";
import { RedisService } from '../../../src/services/redis.service';
import { Container } from 'typedi';

describe('Service: urlService', () => {
  const exKey = 'test:exKey'; 
  const exNxKey = 'test:exNxKey'; 
  const autoKey = 'test:autoKey'; 
  const value = 'test123'; 
  const value2 = 'test1234'; 
  let redisService: RedisService;

  beforeAll(async()=> {
    redisService = Container.get(RedisService);
    await redisService.connect();
  });

  afterAll(async()=> {
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
import "reflect-metadata";
import { RedisService } from '../../../src/services/redis.service';
import { Container } from 'typedi';

describe('service urlService', () => {
  const exKey = 'test:exKey'; 
  const exNxKey = 'test:exNxKey'; 
  const autoKey = 'test:autoKey'; 
  const value = 'test123'; 
  const value2 = 'test1234'; 
  let redisService: RedisService;


  beforeAll(async()=> {
    redisService = Container.get(RedisService);
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

  it('redisService setExNx', async () => {
    const result = await redisService.setExNx(exNxKey, value);
    expect(result).toEqual('OK');

    const getResult= await redisService.get(exNxKey);
    expect(getResult).toEqual(value);

    const result2 = await redisService.setExNx(exNxKey, value2);
    expect(result2).toEqual(null);

    const getResult2= await redisService.get(exNxKey);
    expect(getResult2).toEqual(value);
  });

  it('redisService autoIncr', async () => {
    const result = await redisService.autoIncr(autoKey);
    expect(result).toEqual(1);

    const result2 = await redisService.autoIncr(autoKey);
    expect(result2).toEqual(2);
  });

  it('redisService del', async () => {
    const result1 = await redisService.del(exKey);
    expect(result1).toEqual(1);

    const result2 = await redisService.del(exNxKey);
    expect(result2).toEqual(1);

    const result3 = await redisService.del(autoKey);
    expect(result3).toEqual(1);
  });


});
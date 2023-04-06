import { Request, Response } from 'express';
import redisService from '../../../src/services/redis.service';
import { isBlack, RATE_LIMIT_MAX_REQUESTS } from '../../../src/middlewares/black.middleware';

describe('Middleware: isBlack', () => {
  let req: Request;
  let res: Response;
  let next: jest.Mock;
  let redisClient: any;
  const mockRequest = {
    socket: {
      remoteAddress: '127.0.0.1',
    },
  };
  
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };
  

  beforeAll(() => {
    redisClient = redisService.getClient();
  });

  beforeEach(() => {
    req = mockRequest as Request;
    res = mockResponse();
    next = jest.fn();
  });

  afterEach(async () => {
    await redisClient.flushDb('SYNC' as any);
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  it('should pass the request if the user is not blacklisted and the number of requests is within the limit', async () => {
    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS - 1; i++) {
      await isBlack(req, res, next);
    }

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(RATE_LIMIT_MAX_REQUESTS - 1);
  });

  it('should blacklist the user if the number of requests exceeds the limit', async () => {
    for (let i = 0; i <= RATE_LIMIT_MAX_REQUESTS; i++) {
      await isBlack(req, res, next);
    }

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are blacklisted." });
    expect(next).not.toHaveBeenCalledTimes(RATE_LIMIT_MAX_REQUESTS+1);
  });

  it('should return 403 if the user is blacklisted', async () => {
    const key = `${req.socket.remoteAddress}:undefined`;
    await redisClient.set(`black:${key}`, 1);

    await isBlack(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You are blacklisted." });
    expect(next).not.toHaveBeenCalled();
  });

});
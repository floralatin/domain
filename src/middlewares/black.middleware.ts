import redisService from '../services/redis.service';
import { Request, Response, NextFunction } from 'express';

const redisClient = redisService.getClient();

export const RATE_LIMIT_MAX_REQUESTS = 15; // 时间窗口内最大请求次数
export const RATE_LIMIT_BLACKLIST_EXPIRE = 60 * 60 * 6; // 黑名单过期时间，单位为秒

export const isBlack = async (req: Request, res: Response, next: NextFunction) => {
  const userUid = ((req as any).user?.uid ?? 'undefined') as string;
  const key = `${req.socket.remoteAddress}:${userUid}`;
  try {
    const exists = await redisClient.exists(`black:${key}`);
    if (exists) {
      return res.status(403).json({ message: "You are blacklisted." });
    }

    const result = await redisClient.multi()
      .incr(`requests:${key}`)
      .expire(`requests:${key}`, 1)
      .exec();

    if(result[0] as number > RATE_LIMIT_MAX_REQUESTS) {
      await redisClient.set(`black:${key}`, 1, {
        EX: RATE_LIMIT_BLACKLIST_EXPIRE,
        NX: true,
      });
      return res.status(403).json({ message: "You are blacklisted." });
    }
    next();
  } catch(error) {
    next(error);
  }
};
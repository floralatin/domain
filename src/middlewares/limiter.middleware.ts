import { Container } from "typedi";
import { RedisService } from "../services/redis.service";
import { Request, Response, NextFunction } from "express";
import { ApplicationError } from "../helpers/application.err";

const redis = Container.get(RedisService);
function getLimitKey(ip: string) {
  return `limit:ip:${ip}:${new Date().toISOString().slice(0, 10)}`;
}

async function autoIncrement(ip: string): Promise<number> {
  const key = getLimitKey(ip);
  await redis.setExNx(key, 0, 60 * 60 * 24);
  return await redis.autoIncr(key);
}

async function isLimit(ip: string, capacity: number): Promise<boolean> {
  const count = await autoIncrement(ip);
  if (count > capacity) {
    return true;
  }
  return false;
}

export const ipLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const key = (req as any).user ? (req as any).uid: req.ip;
    const capacity = (req as any).user ? 2000 : 500;
    if (await isLimit(key, capacity)) {
      next(new ApplicationError(429, "Too Many Requests"));
    } else {
      await autoIncrement(key);
      next();
    }
  } catch (error) {
    next(error);
  }
};
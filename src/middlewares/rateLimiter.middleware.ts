import { Request, Response, NextFunction } from 'express';

class TokenBucket {
  capacity: number;
  tokens: number;
  fillTime: number;
  interval: number;

  constructor(capacity: number, fillTime: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.fillTime = fillTime;
    this.interval = fillTime / capacity;

    setInterval(() => {
      if (this.tokens < this.capacity) {
        this.tokens += 1;
      }
    }, this.interval);
  }

  getToken() {
    if (this.tokens > 0) {
      this.tokens -= 1;
      return true;
    } else {
      return false;
    }
  }
}

const tokenBucket = new TokenBucket(100, 10000); // 每秒最多处理 10 个请求

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  if (tokenBucket.getToken()) {
    next();
  } else {
    res.status(429).send('Too Many Requests');
  }
}

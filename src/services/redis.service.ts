import Container, { Service } from "typedi";
import { createClient, createCluster } from 'redis';

import EventEmitter from 'events';

import config from "../config";
import { logger } from "../utils/logger";

@Service()
export class RedisService extends EventEmitter {
  private client!: any;
  private prefix = 'domain:';

  constructor() {
    super();
    this.init().then(()=> {
      this.emit('redis');
    });
  }

  async init() {
    try {
      if(config.isProduction()) {
        this.client = createCluster(config.get("redis.nodes"));
      } else {
        this.client = createClient(config.get("redis.node"));
      }
      await this.client.connect().then(()=> {
        logger.info(`=================================`);
        logger.info(`🚀 Redis connect succeeded`);
        logger.info(`=================================`);
      });
      this.client.on('error', (error: any)=> {
        console.error('Error to Redis', error);
        this.emit('redisError',error);
      });
      this.client.on('connect', () => {
        console.log('Connected to Redis');
      });
    } catch(error) {
      logger.error(`Redis error: ${error}`);
      this.emit('redisError');
    }
  }

  private getKey(key:string): string {
    return `${this.prefix}${key}`;
  }

  async exists(key: string): Promise<boolean> {
    return await this.client.exists(this.getKey(key)) == 0;
  }

  async setExNx(key: string, value: string | number, duration = 60 * 60): Promise<string | null> {
    return await this.client.set(this.getKey(key), value, {
      EX: duration,
      NX: true
    });
  }

  async setEx(key: string, value: string | number, duration = 60 * 60): Promise<string | null> {
    return await this.client.set(this.getKey(key), value, {
      EX: duration
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(this.getKey(key));
  }

  async del(key: string): Promise<number> {
    return await this.client.del(this.getKey(key));
  }

  async autoIncr(key: string): Promise<number> {
    return this.client.incr(this.getKey(key));
  }

  getClient() {
    return this.client;
  }
}

const redisService = Container.get(RedisService);
export default redisService;
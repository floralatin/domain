import Container, { Service } from "typedi";
import { createClient, createCluster, RedisClientType, RedisClusterType } from 'redis';

import config from "../config";
import { logger } from "../utils/logger";

@Service()
export class RedisService {
  private client!:  RedisClientType | RedisClusterType;
  private prefix = 'domain:';
  public ready = false;

  constructor() {
    this.init().then(async ()=> {
      await this.connect();
    }).catch(error=> {
      logger.error(`Redis error: ${error}`);
      this.ready = false;
    });
  }

  async init() {
    if (this.client) {
      return this.client;
    }
    try {
      if(config.isProduction()) {
        this.client = createCluster(config.get("redis.nodes"));
      } else {
        this.client = createClient({
          ...config.get("redis.node"),
          options: {
            prefix: 'myPrefix:'
          },
          pingInterval: 1000,
        });
      }
      this.client.on('error', (error: any)=> {
        logger.error('Redis error:', error);
        this.ready = false;
      });
      this.client.on('ready', () => {
        logger.info(`=================================`);
        logger.info(`🚀 Redis ready succeeded!`);
        logger.info(`=================================`);
        this.ready = true;
      });

      this.client.on('end', () => {
        logger.error('Redis end!');
        this.ready = false;
      });
    } catch(error) {
      logger.error(`Redis create error: ${error}`);
      this.ready = false;
    }
  }

  async connect () {
    if (this.ready) {
      return;
    }
    try {
      return await this.client.connect();
    } catch (error) {
      logger.error(`Redis connect error: ${error}`);
      this.ready = false;
    }
  }

  async disconnect () {
    try {
      return await this.client.quit();
    } catch (error) {
      logger.error(`Redis disconnect error: ${error}`);
      this.ready = false;
    }
  }

  public getKey(key:string): string {
    return `${this.prefix}${key}`;
  }

  async setEx(key: string, value: string | number, duration = 60 * 60): Promise<string | null> {
    return await this.client.set(this.getKey(key), value, {
      EX: duration
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(this.getKey(key));
  }

  getClient() {
    return this.client;
  }
}

const redisService = Container.get(RedisService);
export default redisService;
import Container, { Service } from "typedi";
import { createClient, createCluster } from 'redis';

import EventEmitter from 'events';

import config from "../config";
import { logger } from "../utils/logger";
import { connect } from 'mongoose';

@Service()
export class RedisService {
  private client!: any;
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
        this.client = createClient(config.get("redis.node"));
      }
      this.client.on('error', (error: any)=> {
        console.error('Error to Redis', error);
        this.ready = false;
      });
      this.client.on('ready', () => {
        logger.info(`=================================`);
        logger.info(`🚀 Redis ready succeeded`);
        logger.info(`=================================`);
        this.ready = true;
      });
    } catch(error) {
      logger.error(`Redis error: ${error}`);
      this.ready = false;
    }
  }

  async connect () {
    try {
      return await this.client.connect();
    } catch (error) {
      logger.error(`Redis error: ${error}`);
      this.ready = false;
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
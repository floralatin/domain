import { Service } from "typedi";
import EventEmitter from 'events';

import mongoose, { Connection } from "mongoose";

import config from "../config";
import { logger } from "../utils/logger";

@Service()
export class MongoService extends EventEmitter{
  private mongoConnection!: Connection;
  public ready = true;

  constructor() {
    super();
    this.init().then(()=> {
      this.emit('mongo');
    });
  }

  async init() {
    if (this.mongoConnection) {
      return this.mongoConnection;
    }
    try {
      await mongoose.connect(config.get('mongo.uri'), config.get('mongo.options')).then(()=> {
        logger.info(`=================================`);
        logger.info(`🚀 MongoDB connect succeeded`);
        logger.info(`=================================`);
      });
      this.mongoConnection = mongoose.connection;
      this.mongoConnection.on('error', (err: any)=> {
        logger.error(`MongoDB error: ${err}`);
        this.emit('mongoError');
      });
    } catch(err) {
      logger.error(`MongoDB error: ${err}`);
      this.emit('mongoError');
    }
  }

}

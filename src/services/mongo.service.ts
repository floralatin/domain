import Container, { Service } from "typedi";
import mongoose, { Connection, Mongoose } from "mongoose";

import config from "../config";
import { logger } from "../utils/logger";

@Service()
export class MongoService{
  private mongoConnection!: Connection;
  private mongoClient!: Mongoose;
  public ready = false;

  constructor() {
    this.init().then(async()=> {
      await this.connect();
    }).catch(error => {
      logger.error(`MongoService error: ${error}`);
    });
  }

  async init() {
    this.mongoClient = mongoose;
    this.mongoConnection = mongoose.connection;

    this.mongoConnection.on('error', (error: any)=> {
      logger.error(`MongoDB error: ${error}`);
      this.ready = false;
    });

    this.mongoConnection.on('connected', ()=> {
      logger.info(`=================================`);
      logger.info(`🚀 MongoDB connect succeeded`);
      logger.info(`=================================`);
      this.ready = true;
    });

    this.mongoConnection.on('disconnected', ()=> {
      logger.info(`MongoDB disconnect!`);
      this.ready = false;
    });

    this.mongoConnection.on('close', (error: any)=> {
      logger.error(`MongoDB close: ${error}`);
      this.ready = false;
    });

  }

  async connect() {
    if (this.ready) {
      return this.ready;
    }
    try {
      await this.mongoClient.connect(config.get('mongo.uri'), config.get('mongo.options'));
    } catch(error) {
      logger.error(`MongoDB connect error: ${error}`);
    }
  }

  async disconnect() {
    try {
      await this.mongoClient.disconnect();
    } catch(error) {
      logger.error(`MongoDB disconnect error: ${error}`);
    }
  }

}

const mongoService = Container.get(MongoService);
export default mongoService;
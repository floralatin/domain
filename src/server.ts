import "reflect-metadata";
import { Inject, Service, Container } from "typedi";

import express, { Router, Request, Response } from "express";
import config from "./config";
import { logger } from "./utils/logger";

import helmet from "helmet";
import cors from "cors";
import bodyParser from 'body-parser';
import compression from "compression";
import { rateLimiter } from "./middlewares/rateLimiter.middleware";
import { ipLimiter } from "./middlewares/limiter.middleware";
import { errorHandler } from "./middlewares/error.middleware";

import { UrlRoutes } from "./routes/url.route";
import { MongoService } from "./services/mongo.service";
import { RedisService } from "./services/redis.service";

@Service()
export class App {
  private app: express.Application;
  private port: number = config.get("port") || 3000;
  private health = false;
  
  @Inject()
  private urlRoutes: UrlRoutes = Container.get(UrlRoutes);
  @Inject()
  private mongoService: MongoService = Container.get(MongoService);
  @Inject()
  private redisService: RedisService = Container.get(RedisService);

  constructor() {

    this.app = express();
    this.app.on('error', (error)=> {
      logger.error('app on error', error);
      this.health = false;
    });
    this.app.on('start', (data)=> {
      logger.info('app on start', data);
      this.health = true;
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(rateLimiter);
    this.app.use(ipLimiter);
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  private initializeRoutes() {
    this.app.use(Router().get('/health', (req: Request, res: Response) => {
      res.status(200).json({ health: this.health });
    }));
    this.app.use('/',this.urlRoutes.getRouter());
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${config.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
      this.app.emit("start");
    });
  }

  public getServer() {
    return this.app;
  }
}

export const app = Container.get(App);
export default app;

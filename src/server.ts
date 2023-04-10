import "reflect-metadata";
import { container, singleton } from 'tsyringe';

import http, { Server } from 'http';
import express, { Request, Response, NextFunction } from "express";
import config from "./config";
import { logger } from "./utils/logger";

import helmet from "helmet";
import cors from "cors";
import bodyParser from 'body-parser';
import compression from "compression";
import cookieParser from 'cookie-parser';
import { rate } from "./middlewares/limiter.middleware";
import { isBlack } from "./middlewares/black.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { asyncHook } from "./middlewares/asyncHook.middleware";

import { UrlRoutes } from "./routes/url.route";
import { MongoService } from "./services/mongo.service";
import { RedisService } from "./services/redis.service";

@singleton()
export class App {
  public app: express.Application;
  public port: number = config.get("port") || 3000;
  public httpServer!: Server;
  public ready = false;

  constructor(
    public readonly urlRoutes: UrlRoutes,
    public readonly mongoService: MongoService,
    public readonly redisService: RedisService
  ) {

    this.app = express();
    this.initializeDB().then();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();

    this.httpServer = http.createServer(this.app);
    this.httpServer.on('listening', () => {
      logger.info('http listening');
      this.ready = true;
    });
    this.httpServer.on('error', (error) => {
      logger.error('http server:', error.toString());
      this.ready = false;
    });
    this.httpServer.on('close', () => {
      logger.warn('http close');
      this.ready = false;
    });
  }

  private async initializeDB() {
    await this.mongoService.connect();
    await this.redisService.connect();
  }

  private initializeMiddlewares() {
    this.app.use(asyncHook);
    this.app.use(this.healthCheckMiddleware());
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(rate);
    this.app.use(isBlack);
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(cookieParser());
  }

  private healthCheckMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.path !== '/ping') {
        next();
      } else {
        this.ready = this.ready && this.mongoService.ready && this.redisService.ready;
        if (this.ready) {
          res.status(200).json('pong');
        } else {
          res.status(500).json('false');
        }
      }
    };
  }

  private initializeRoutes() {
    this.app.use('/', this.urlRoutes.getRouter());
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  public listen() {
    this.httpServer.listen(this.port, async () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${config.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
      this.ready = true;
    });
  }

  public getServer() {
    return this.httpServer;
  }
}

export const app = container.resolve(App);
export default app;

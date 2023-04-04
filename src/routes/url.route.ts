import { Router } from "express";
import { Container, Inject, Service } from "typedi";
import { UrlController } from "../controllers/url.controller";
import { auth } from "../middlewares/auth.middleware";


@Service()
export class UrlRoutes {
  public path = "/";
  private router: Router;
  @Inject()
  private urlController: UrlController = Container.get(UrlController);

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}url`,
      auth,
      this.urlController.create.bind(this.urlController)
    );
    this.router.get(
      `${this.path}:code`,
      this.urlController.redirect.bind(this.urlController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

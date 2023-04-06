import { Router } from "express";
import { Service, Container } from "typedi";
import { auth } from "../middlewares/auth.middleware";
import { UrlController }from "../controllers/url.controller";

@Service()
export class UrlRoutes {
  public path = "/";
  private router: Router;
  private urlController: UrlController;

  constructor() {
    this.router = Router();
    this.urlController = Container.get(UrlController);
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

const urlRoutes = Container.get(UrlRoutes);
export default urlRoutes;
import "reflect-metadata";
import { Container, Service } from "typedi";

import _ from "lodash";

import developmentConfig from "./development";
import testingConfig from "./testing";
import productionConfig from "./production";
import stagingConfig from "./staging";

const configs = {
  development: developmentConfig,
  testing: testingConfig,
  production: productionConfig,
  staging: stagingConfig,
};
const env = process.env.NODE_ENV?.toLowerCase() || "development";

@Service()
export class Config {
  env = env;
  cache: { [k: string]: any } = {};

  constructor() {
    Object.assign(this.cache, { ...(configs as any)[env] });
  }

  isProduction() {
    return this.env == 'production';
  }

  isDevelopment() {
    return this.env == 'development';
  }

  get(key: string): string | any {
    return _.get(this.cache, key);
  }
}

export const configService = Container.get(Config);

export default configService;

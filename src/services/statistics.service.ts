import Container, { Service } from "typedi";
import { Statistics } from "../interfaces/statistics.interface";
import { StatisticsModel } from "../models/statistics.model";

@Service()
export class StatisticsService {

  public async createByOption(option: Statistics): Promise<Statistics> {
    return await StatisticsModel.create({ ...option });
  }

}
const statisticsService = Container.get(StatisticsService);
export default statisticsService;
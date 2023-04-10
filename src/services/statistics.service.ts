import { container, singleton } from 'tsyringe';
import { Statistics } from "../interfaces/statistics.interface";
import { StatisticsModel } from "../models/statistics.model";


@singleton()
export class StatisticsService {

  public async createByOption(option: Statistics): Promise<Statistics> {
    return await StatisticsModel.create({ ...option });
  }

}
const statisticsService = container.resolve(StatisticsService);
export default statisticsService;
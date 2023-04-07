import Container, { Service } from "typedi";
import { User } from "../interfaces/user.interface";
import { UserModel } from '../models/user.model';
import { ObjectId } from "mongoose";

@Service()
export class UserService {
  
  public async findById(_id: ObjectId): Promise<User | null> {
    return await UserModel.findOne({ _id: {$eq: _id } });
  }

}
const userService = Container.get(UserService);
export default userService;
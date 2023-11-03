import {UserModel} from "../../db/db"
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import 'reflect-metadata'
import {HydratedUserType} from "../../types/usersTypes";

@injectable()
export class UsersRepository {
  async save(model: HydratedUserType) {
    return await model.save()
  }

  async deleteUser(id: ObjectId): Promise<boolean> {
    const result = await UserModel.deleteOne({id}).exec()

    return result.deletedCount === 1
  }
}
import bcrypt from 'bcrypt'
import {UsersRepository} from "../infrastructure/repositories/usersRepository";
import {ViewUserModel} from "../features/users/models/ViewUserModel";
import {ObjectId} from "mongodb";
import {inject, injectable} from "inversify";
import {UserModel} from "../db/db";

@injectable()
export class UsersService {
  constructor(@inject(UsersRepository) protected usersRepository: UsersRepository) {}

  async createUser(login: string, password: string, email: string): Promise<ViewUserModel> {
    const passwordHash = await bcrypt.hash(password, 10)

    const smartUserModel = UserModel.makeInstance(login, email, passwordHash, true)

    await this.usersRepository.save(smartUserModel)
    return {
      id: smartUserModel.id,
      login: smartUserModel.accountData.login,
      email: smartUserModel.accountData.email,
      createdAt: smartUserModel.accountData.createdAt
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false
    return await this.usersRepository.deleteUser(new ObjectId(id))
  }
}
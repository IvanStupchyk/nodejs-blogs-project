import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'
import {UsersRepository} from "../../repositories/usersRepository";
import {ViewUserModel} from "../../features/users/models/ViewUserModel";
import {ObjectId} from "mongodb";
import {inject, injectable} from "inversify";
import {UserType} from "./dto/createUserDto";

@injectable()
export class UsersService {
  constructor(@inject(UsersRepository) protected usersRepository: UsersRepository) {}

  async createUser(login: string, password: string, email: string): Promise<ViewUserModel> {
    const passwordHash = await bcrypt.hash(password, 10)

    const newUser: UserType = new UserType(
      new ObjectId(),
      {
      login,
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    },
      {
      confirmationCode: uuidv4(),
      expirationDate: new Date(),
      isConfirmed: true
    },
      []
    )

    return await this.usersRepository.createUser(newUser)
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false
    return await this.usersRepository.deleteUser(new ObjectId(id))
  }
}
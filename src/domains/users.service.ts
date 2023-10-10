import { v4 as uuidv4 } from 'uuid'
import {UserType} from "../types/generalTypes";
import bcrypt from 'bcrypt'
import {usersRepository} from "../repositories/usersRepository";
import {ViewUserModel} from "../features/users/models/ViewUserModel";

export const usersService = {
  async createUser(login: string, password: string, email: string): Promise<ViewUserModel> {
    const passwordHash = await bcrypt.hash(password, 10)

    const newUser: UserType = {
      id: uuidv4(),
      login,
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    }

    return await usersRepository.createUser(newUser)
  },

  async deleteUser(id: string): Promise<boolean> {
    return await usersRepository.deleteUser(id)
  }
}
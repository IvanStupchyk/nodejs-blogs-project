import {usersCollections} from "../db/db"
import {UserType} from "../types/generalTypes";
import {ViewUserModel} from "../features/users/models/ViewUserModel";

export const usersRepository = {
  async loginUser(loginOrEmail: string): Promise<UserType | null> {
    return await usersCollections.findOne({
      $or: [
        { login: loginOrEmail },
        { email: loginOrEmail }
      ]
    })
  },

  async createUser(newUser: UserType): Promise<ViewUserModel> {
    await usersCollections.insertOne({...newUser})

    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    const result = await usersCollections.deleteOne({id})

    return result.deletedCount === 1
  }
}
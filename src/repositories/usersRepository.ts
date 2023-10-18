import {usersCollections} from "../db/db"
import {UserType} from "../types/generalTypes";
import {ViewUserModel} from "../features/users/models/ViewUserModel";

export const usersRepository = {
  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
    return await usersCollections.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail }
      ]
    })
  },

  async createUser(newUser: UserType): Promise<ViewUserModel> {
    await usersCollections.insertOne({...newUser})

    return {
      id: newUser.id,
      login: newUser.accountData.login,
      email: newUser.accountData.email,
      createdAt: newUser.accountData.createdAt
    }
  },

  async findUserByConfirmationCode(code: string): Promise<UserType | null> {
    return await usersCollections.findOne({'emailConfirmation.confirmationCode' : code})
  },

  async findUserByEmail(email: string): Promise<UserType | null> {
    return await usersCollections.findOne({'accountData.email' : email}, { projection: {_id: 0}})
  },

  async updateConfirmation(id: string): Promise<boolean> {
    const result = await usersCollections.updateOne(
      {id},
      {$set: {'emailConfirmation.isConfirmed' : true}}
    )

    return result.modifiedCount === 1
  },

  async updateConfirmationCodeAndExpirationTime(id: string, newExpirationDate: Date, newCode: string): Promise<boolean> {
    const result = await usersCollections.updateOne(
      {id},
      {$set: {
        'emailConfirmation.expirationDate': newExpirationDate,
         'emailConfirmation.confirmationCode': newCode
      }}
    )

    return result.modifiedCount === 1
  },

  async deleteUser(id: string): Promise<boolean> {
    const result = await usersCollections.deleteOne({id})

    return result.deletedCount === 1
  }
}
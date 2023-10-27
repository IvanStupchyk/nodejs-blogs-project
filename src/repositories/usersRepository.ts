import {UserModel} from "../db/db"
import {UserType} from "../types/generalTypes";
import {ViewUserModel} from "../features/users/models/ViewUserModel";

export const usersRepository = {
  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
    return await UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail }
      ]
    }).exec()
  },

  async createUser(newUser: UserType): Promise<ViewUserModel> {
    let userInstance = new UserModel()
    userInstance.id = newUser.id
    userInstance.accountData = newUser.accountData
    userInstance.emailConfirmation= newUser.emailConfirmation
    await userInstance.save()

    return {
      id: userInstance.id,
      login: userInstance.accountData.login,
      email: userInstance.accountData.email,
      createdAt: userInstance.accountData.createdAt
    }
  },

  async findUserByConfirmationCode(code: string): Promise<UserType | null> {
    return await UserModel.findOne({'emailConfirmation.confirmationCode' : code}).exec()
  },

  async findUserByEmail(email: string): Promise<UserType | null> {
    return await UserModel.findOne({'accountData.email' : email}, {_id: 0, __v: 0}).exec()
  },

  async updateConfirmation(id: string): Promise<boolean> {
    const result = await UserModel.findOneAndUpdate(
      {id},
      {$set: {'emailConfirmation.isConfirmed' : true}}
    ).exec()

    return !!result
  },

  async changeUserPassword(userId: string, passwordHash: string): Promise<boolean> {
    const result = await UserModel.findOneAndUpdate(
      {id: userId},
      {$set: {'accountData.passwordHash': passwordHash}}
    ).exec()

    return !!result
  },

  async updateConfirmationCodeAndExpirationTime(id: string, newExpirationDate: Date, newCode: string): Promise<boolean> {
    const result = await UserModel.findOneAndUpdate(
      {id},
      {$set: {
        'emailConfirmation.expirationDate': newExpirationDate,
         'emailConfirmation.confirmationCode': newCode
      }}
    ).exec()

    return !!result
  },

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({id}).exec()

    return result.deletedCount === 1
  }
}
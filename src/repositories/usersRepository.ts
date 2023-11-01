import {UserModel} from "../db/db"
import {CommentStatus, UserType} from "../types/generalTypes";
import {ViewUserModel} from "../features/users/models/ViewUserModel";
import {ObjectId} from "mongodb";

export class UsersRepository {
  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
    return await UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail }
      ]
    }).exec()
  }

  async createUser(newUser: UserType): Promise<ViewUserModel> {
    let userInstance = new UserModel()
    userInstance.id = newUser.id
    userInstance.accountData = newUser.accountData
    userInstance.emailConfirmation= newUser.emailConfirmation
    userInstance.commentsLikes = newUser.commentsLikes
    await userInstance.save()

    return {
      id: userInstance.id,
      login: userInstance.accountData.login,
      email: userInstance.accountData.email,
      createdAt: userInstance.accountData.createdAt
    }
  }

  async findUserByConfirmationCode(code: string): Promise<UserType | null> {
    return await UserModel.findOne({'emailConfirmation.confirmationCode' : code}).exec()
  }

  async findUserByEmail(email: string): Promise<UserType | null> {
    return await UserModel.findOne({'accountData.email' : email}, {_id: 0, __v: 0}).exec()
  }

  async updateConfirmation(id: ObjectId): Promise<boolean> {
    const result = await UserModel.findOneAndUpdate(
      {id},
      {$set: {'emailConfirmation.isConfirmed' : true}}
    ).exec()

    return !!result
  }

  async changeUserPassword(userId: ObjectId, passwordHash: string): Promise<boolean> {
    const result = await UserModel.findOneAndUpdate(
      {id: userId},
      {$set: {'accountData.passwordHash': passwordHash}}
    ).exec()

    return !!result
  }

  async updateConfirmationCodeAndExpirationTime(id: ObjectId, newExpirationDate: Date, newCode: string): Promise<boolean> {
    const result = await UserModel.findOneAndUpdate(
      {id},
      {$set: {
        'emailConfirmation.expirationDate': newExpirationDate,
         'emailConfirmation.confirmationCode': newCode
      }}
    ).exec()

    return !!result
  }

  async updateExistingUserCommentLike(userId: ObjectId, myStatus: CommentStatus, commentId: ObjectId): Promise<any> {
    const result = await UserModel.findOneAndUpdate(
      {id: userId, 'commentsLikes.commentId': commentId},
      {$set: { 'commentsLikes.$.myStatus': myStatus }}
    ).exec()

    return !!result
  }

  async setNewUserCommentLike(userId: ObjectId, myStatus: CommentStatus, commentId: ObjectId, createdAt: string): Promise<any> {
    const result = await UserModel.findOneAndUpdate(
      {id: userId},
      {$push: { commentsLikes: {
          commentId,
          myStatus,
          createdAt
      }}}
    ).exec()

    return !!result
  }

  async deleteUser(id: ObjectId): Promise<boolean> {
    const result = await UserModel.deleteOne({id}).exec()

    return result.deletedCount === 1
  }
}
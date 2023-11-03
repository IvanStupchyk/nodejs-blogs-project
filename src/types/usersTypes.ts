import mongoose, {HydratedDocument} from "mongoose";
import {UserType} from "../dto/userDto";
import {CommentStatus} from "./generalTypes";
import {ObjectId} from "mongodb";

export type UserMethodsType = {
  canBeConfirmed: (code: string) => boolean,
  confirm: (code: string) => void
  changeUserPassword: (passwordHash: string) => void
  updateConfirmationCodeAndExpirationTime: (expirationDate: Date, code: string) => void
  setNewUserCommentLike: (myStatus: CommentStatus, commentId: ObjectId) => void
  updateExistingUserCommentLike: (myStatus: CommentStatus, commentId: ObjectId) => void
}

export type UserModelType = mongoose.Model<UserType, {}, UserMethodsType>

type UserModelStaticType = mongoose.Model<UserType> & {
  makeInstance(
    login: string,
    email: string,
    passwordHash: string,
    superUser: boolean
  ): HydratedDocument<UserType, UserMethodsType>
}

export type UserModelFullType = UserModelType & UserModelStaticType

export type HydratedUserType = HydratedDocument<UserType, UserMethodsType>
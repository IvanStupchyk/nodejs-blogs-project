import mongoose from "mongoose";
import {UserType} from "../dto/userDto";
import {UserModel} from "../db/db";
import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add";
import {UserMethodsType, UserModelFullType, HydratedUserType} from "../types/usersTypes";
import {emailConfirmationSchema} from "../schemas/emailConfirmationSchema";
import {userCommentLikesSchema} from "../schemas/userCommentLikesSchema";
import {accountDataSchema} from "../schemas/accountDataSchema";
import {CommentStatus} from "../types/generalTypes";

export const userSchema = new mongoose.Schema<UserType, UserModelFullType, UserMethodsType>({
  id: {type: String, required: true},
  accountData: {
    type: accountDataSchema,
    required: true
  },
  emailConfirmation: {
    type: emailConfirmationSchema,
    required: true
  },
  commentsLikes: [userCommentLikesSchema]
})

userSchema.method('canBeConfirmed', function canBeConfirmed(code: string) {
  const that = this as HydratedUserType

  return that.emailConfirmation.confirmationCode === code && that.emailConfirmation.expirationDate > new Date()
})

userSchema.method('confirm', function confirm(code: string) {
  const that = this as HydratedUserType

  if  (!that.canBeConfirmed(code)) throw new Error('code is expired')
  if (that.emailConfirmation.isConfirmed) throw new Error('email is already confirmed')

  return that.emailConfirmation.isConfirmed = true
})

userSchema.method('changeUserPassword', function changeUserPassword(passwordHash: string) {
  const that = this as HydratedUserType

  return that.accountData.passwordHash = passwordHash
})

userSchema.method('updateConfirmationCodeAndExpirationTime',
  function updateConfirmationCodeAndExpirationTime(date: Date, code: string) {
  const that = this as HydratedUserType

  that.emailConfirmation.expirationDate = date
  that.emailConfirmation.confirmationCode = code
})

userSchema.method('setNewUserCommentLike',
  function setNewUserCommentLike(myStatus: CommentStatus, commentId: ObjectId) {
    const that = this as HydratedUserType

    that.commentsLikes.push({
      commentId,
      myStatus,
      createdAt: new Date().toISOString()
    })
})

userSchema.method('updateExistingUserCommentLike',
  function updateExistingUserCommentLike(myStatus: CommentStatus, commentId: ObjectId) {
    const that = this as HydratedUserType

    const initialComment = that.commentsLikes.find(c => new ObjectId(c.commentId).equals(commentId))

    if (initialComment) initialComment.myStatus = myStatus
})

userSchema.static('makeInstance', function makeInstance(
  login: string,
  email: string,
  passwordHash: string,
  superUser: boolean
) {
  return new UserModel({
    id: new ObjectId(),
    accountData: {
      login,
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    },
    emailConfirmation: {
      confirmationCode: uuidv4(),
      expirationDate: superUser? new Date() : add(new Date(), {
        hours: 1,
        minutes: 30
      }),
      isConfirmed: superUser
    },
    commentsLikes: []
  })
})
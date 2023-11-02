import mongoose from "mongoose";
import {AccountDataType, EmailConfirmationType, UserCommentLikesType} from "../../../types/generalTypes";
import {UserType} from "../dto/createUserDto";

const emailConfirmationSchema = new mongoose.Schema<EmailConfirmationType>({
  confirmationCode: {type: String, required: true},
  expirationDate: {type: Date, required: true},
  isConfirmed: {type: Boolean, required: true}
})

const userCommentLikesSchema = new mongoose.Schema<UserCommentLikesType>({
  commentId: {type: String, required: true},
  myStatus: {type: String, required: true},
  createdAt: {type: String, required: true}
})

const accountDataSchema = new mongoose.Schema<AccountDataType>({
  login: {type: String, required: true},
  email: {type: String, required: true},
  passwordHash: {type: String, required: true},
  createdAt: {type: String, required: true}
})

export const userSchema = new mongoose.Schema<UserType>({
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
});
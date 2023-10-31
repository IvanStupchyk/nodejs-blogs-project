import mongoose from "mongoose";
import {
  AccountDataType, APIRequestsCountType,
  BlogType,
  CommentatorInfoType, CommentLikesInfoType, CommentType,
  EmailConfirmationType,
  PostType, RefreshTokenDeviceType, UserCommentLikesType,
  UserType
} from "../../types/generalTypes";

export const blogSchema = new mongoose.Schema<BlogType>({
  id: {type: String, required: true},
  name: {type: String, required: true},
  description: {type: String, required: true},
  websiteUrl: {type: String, required: true},
  isMembership: {type: Boolean, required: true},
  createdAt: {type: String, required: true}
})

export const postSchema = new mongoose.Schema<PostType>({
  id: {type: String, required: true},
  title: {type: String, required: true},
  shortDescription: {type: String, required: true},
  content: {type: String, required: true},
  blogId: {type: String, required: true},
  createdAt: {type: String, required: true},
  blogName: {type: String, required: true}
})

const accountDataSchema = new mongoose.Schema<AccountDataType>({
  login: {type: String, required: true},
  email: {type: String, required: true},
  passwordHash: {type: String, required: true},
  createdAt: {type: String, required: true}
})

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
})

const commentatorInfoSchema = new mongoose.Schema<CommentatorInfoType>({
  userId: {type: String, required: true},
  userLogin: {type: String, required: true}
})

const commentLikesInfoSchema = new mongoose.Schema<CommentLikesInfoType>({
  likesCount: {type: Number, required: true},
  dislikesCount: {type: Number, required: true}
})

export const commentSchema = new mongoose.Schema<CommentType>({
  id: {type: String, required: true},
  content: {type: String, required: true},
  postId: {type: String, required: true},
  commentatorInfo: {
    type: commentatorInfoSchema,
    required: true
  },
  likesInfo: {
    type: commentLikesInfoSchema,
    required: true
  },
  createdAt: {type: String, required: true}
})

export const refreshTokenDeviceSchema = new mongoose.Schema<RefreshTokenDeviceType>({
  id: {type: String, required: true},
  ip: {type: String, required: true},
  title: {type: String, required: true},
  lastActiveDate: {type: Date, required: true},
  expirationDate: {type: Date, required: true},
  deviceId: {type: String, required: true},
  userId: {type: String, required: true}
})

export const apiRequestSchema = new mongoose.Schema<APIRequestsCountType>({
  ip: {type: String, required: true},
  URL: {type: String, required: true},
  date: {type: Date, required: true}
})
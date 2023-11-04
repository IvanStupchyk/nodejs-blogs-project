import {SortOrder} from "../constants/sortOrder";
import {ViewUserModel} from "../features/users/models/ViewUserModel";
import {mockBlogModel, mockCommentModel, mockPostModel, mockUserModel} from "../constants/blanks";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";
import {ObjectId} from "mongodb";
import {PostType} from "../dto/postDto";
import {BlogType} from "../domains/blogs/dto/createBlogDto";
import {PostViewModel} from "../features/posts/models/PostViewModel";

export type BlogsType = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: Array<BlogType>
}

export type CommentatorInfoType = {
  userId: ObjectId,
  userLogin: string
}

export enum CommentStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike'
}

export type UserCommentLikesType = {
  commentId: ObjectId,
  myStatus: CommentStatus,
  createdAt: string
}

export type CommentLikesInfoType = {
  likesCount: number,
  dislikesCount: number
}

export type CommentLikesViewType = {
  likesCount: number,
  dislikesCount: number,
  myStatus: CommentStatus
}

export type PostLikeUserInfo = {
  addedAt: string
  userId: ObjectId
  login: string
}

export type ExtendedLikesInfoType = {
  likesCount: number
  dislikesCount: number
  newestLikes: Array<PostLikeUserInfo>
}

export type ExtendedLikesInfoViewType = {
  likesCount: number
  dislikesCount: number
  myStatus: CommentStatus
  newestLikes: Array<PostLikeUserInfo>
}

export type DeviceViewType = {
  ip: string,
  title: string
  lastActiveDate: Date
  deviceId: ObjectId
}

export type CommentsType = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: Array<CommentViewModel>
}

export type APIRequestsCountType = {
  ip: string,
  URL: string
  date: Date
}

export type AccountDataType = {
  login: string
  email: string
  passwordHash: string
  createdAt: string
}

export type EmailConfirmationType = {
  confirmationCode: string,
  expirationDate: Date,
  isConfirmed: boolean
}

export type PostsType = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: Array<PostViewModel>
}

export type UsersType = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: Array<ViewUserModel>
}

export type PostsLikesInfo = {
  id: ObjectId
  userId: ObjectId
  myStatus: CommentStatus
  postId: ObjectId
  addedAt: string
}

export type SortConditionsType = {
  pageNumber: string,
  pageSize: string,
  sortBy: keyof BlogType | keyof PostType | keyof ViewUserModel | keyof CommentViewModel,
  model: typeof mockBlogModel | typeof mockPostModel | typeof mockUserModel | typeof mockCommentModel
  sortDirection: SortOrder.asc | SortOrder.desc,
}
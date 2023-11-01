import {SortOrder} from "../constants/sortOrder";
import {ViewUserModel} from "../features/users/models/ViewUserModel";
import {mockBlogModel, mockCommentModel, mockPostModel, mockUserModel} from "../constants/blanks";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";
import {ObjectId} from "mongodb";

export class BlogType {
  constructor(public id: ObjectId,
              public name: string,
              public description: string,
              public websiteUrl: string,
              public createdAt: string,
              public isMembership: boolean
  ) {}
}

// export type BlogType = {
//   id: ObjectId,
//   name: string
//   description: string
//   websiteUrl: string
//   createdAt: string
//   isMembership: boolean
// }

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

export class CommentType {
  constructor( public id: ObjectId,
               public content: string,
               public postId: ObjectId,
               public commentatorInfo: CommentatorInfoType,
               public likesInfo: CommentLikesInfoType,
               public createdAt: string
  ) {}
}
// export type CommentType = {
//   id: ObjectId,
//   content: string
//   postId: ObjectId
//   commentatorInfo: CommentatorInfoType
//   likesInfo: CommentLikesInfoType
//   createdAt: string
// }

export class RefreshTokenDeviceType {
  constructor(public id: ObjectId,
              public ip: string,
              public title: string,
              public lastActiveDate: Date,
              public expirationDate: Date,
              public deviceId: ObjectId,
              public userId: ObjectId,
  ) {}
}
// export type RefreshTokenDeviceType = {
//   id: ObjectId,
//   ip: string,
//   title: string
//   lastActiveDate: Date
//   expirationDate: Date
//   deviceId: ObjectId
//   userId: ObjectId
// }

export type RefreshTokenDeviceViewType = {
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

export class PostType {
  constructor(public id: ObjectId,
              public title: string,
              public shortDescription: string,
              public content: string,
              public blogId: ObjectId,
              public createdAt: string,
              public blogName: string,
  ) {}
}
// export type PostType = {
//   id: ObjectId
//   title: string
//   shortDescription: string
//   content: string
//   blogId: ObjectId
//   createdAt: string
//   blogName: string
// }

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

export class UserType  {
  constructor( public id: ObjectId,
               public accountData: AccountDataType,
               public emailConfirmation: EmailConfirmationType,
               public commentsLikes: Array<UserCommentLikesType>
  ) {}
}

// export type UserType = {
//   id: ObjectId
//   accountData: AccountDataType
//   emailConfirmation: EmailConfirmationType
//   commentsLikes: Array<UserCommentLikesType>
// }

export type PostsType = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: Array<PostType>
}

export type UsersType = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: Array<ViewUserModel>
}

export type SortConditionsType = {
  pageNumber: string,
  pageSize: string,
  sortBy: keyof BlogType | keyof PostType | keyof ViewUserModel | keyof CommentViewModel,
  model: typeof mockBlogModel | typeof mockPostModel | typeof mockUserModel | typeof mockCommentModel
  sortDirection: SortOrder.asc | SortOrder.desc,
}
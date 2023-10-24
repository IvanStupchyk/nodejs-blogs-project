import {SortOrder} from "../constants/sortOrder";
import {ViewUserModel} from "../features/users/models/ViewUserModel";
import {mockBlogModel, mockCommentModel, mockPostModel, mockUserModel} from "../constants/blanks";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";

export type BlogType = {
  id: string,
  name: string
  description: string
  websiteUrl: string
  createdAt: string
  isMembership: boolean
}

export type BlogsType = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: Array<BlogType>
}

export type CommentatorInfoType = {
  userId: string,
  userLogin: string
}

export type CommentType = {
  id: string,
  content: string
  postId: string
  commentatorInfo: CommentatorInfoType
  createdAt: string
}

export type RefreshTokenDeviceType = {
  id: string,
  ip: string,
  title: string
  lastActiveDate: Date | string
  expirationDate: Date | string
  deviceId: string
  userId: string
}

export type RefreshTokenDeviceViewType = {
  ip: string,
  title: string
  lastActiveDate: Date | string
  deviceId: string
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

export type PostType = {
  id: string
  title: string
  shortDescription: string
  content: string
  blogId: string
  createdAt: string
  blogName: string
}

export type AccountDataType = {
  login: string
  email: string
  passwordHash: string
  createdAt: string
}

type EmailConfirmationType = {
  confirmationCode: string,
  expirationDate: Date,
  isConfirmed: boolean
}

export type UserType = {
  id: string
  accountData: AccountDataType
  emailConfirmation: EmailConfirmationType
  invalidRefreshTokens: Array<string>
}

export type InvalidRefreshTokensType = {
  invalidRefreshTokens: Array<string>
}

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
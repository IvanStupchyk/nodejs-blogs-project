import {SortOrder} from "../constants/sortOrder";
import {ViewUserModel} from "../features/users/models/ViewUserModel";

export type blogSortedParams = {
  searchNameTerm: string
  sortBy: keyof BlogType
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: number
  pageSize: number
  skipSize: number
}

export type postSortedParams = {
  sortBy: keyof BlogType
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: number
  pageSize: number
  skipSize: number
}

export type userSortedParams = {
  searchLoginTerm: string
  searchEmailTerm: string
  sortBy: keyof ViewUserModel
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: number
  pageSize: number
  skipSize: number
}

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

export type PostType = {
  id: string
  title: string
  shortDescription: string
  content: string
  blogId: string
  createdAt: string
  blogName: string
}

export type UserType = {
  id: string
  login: string
  email: string
  passwordHash: string
  createdAt: string
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
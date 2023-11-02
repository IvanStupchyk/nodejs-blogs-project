import {UserModel} from "../db/db"
import {UserCommentLikesType, UsersType, UserType} from "../types/generalTypes";
import {
  createDefaultSortedParams,
  getPagesCount
} from "../utils/utils";
import {GetSortedUsersModel} from "../features/users/models/GetSortedUsersModel";
import {mockUserModel} from "../constants/blanks";
import {ViewUserModel} from "../features/users/models/ViewUserModel";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import 'reflect-metadata'

@injectable()
export class UsersQueryRepository  {
  async getSortedUsers(params: GetSortedUsersModel): Promise<UsersType> {
    const {searchLoginTerm, searchEmailTerm,} = params

    const {
      pageNumber,
      pageSize,
      skipSize,
      sortBy,
      sortDirection
    } = createDefaultSortedParams({
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      model: mockUserModel
    })

    let findCondition = {}

    if (searchLoginTerm && !searchEmailTerm) {
      findCondition = { 'accountData.login': { $regex: searchLoginTerm, $options: 'i' }}
    }

    if (searchEmailTerm && !searchLoginTerm) {
      findCondition = { 'accountData.email': { $regex: searchEmailTerm, $options: 'i' }}
    }

    if (searchEmailTerm && searchLoginTerm) {
      findCondition = { $or: [
        { 'accountData.login': {$regex: searchLoginTerm, $options: 'i'} },
        { 'accountData.email': {$regex: searchEmailTerm, $options: 'i'} }
      ]}
    }

    const sortField = `accountData.${sortBy}`

    //@ts-ignore
    const users: Array<UserType> = await UserModel
      .find(findCondition, {_id: 0, __v: 0})
      .sort({[sortField]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .lean()

    const usersCount = await UserModel.countDocuments(findCondition)

    const pagesCount = getPagesCount(usersCount , pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: usersCount,
      items: users.map(u => {
        return {
          id: u.id,
          email: u.accountData.email,
          login: u.accountData.login,
          createdAt: u.accountData.createdAt
        }
      })
    }
  }

  async findUserById(id: ObjectId): Promise<ViewUserModel | null> {
    const user = await UserModel.findOne({id}, {_id: 0, __v: 0}).exec()

    return user ? {
      id: user.id,
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt
    } : null
  }

  async findUserCommentLikesById(id: ObjectId): Promise<Array<UserCommentLikesType> | null> {
    const user = await UserModel.findOne({id}).exec()

    return user ? [...user.commentsLikes] : null
  }

  async fetchAllUserData(id: ObjectId): Promise<UserType | null> {
    const user = await UserModel.findOne({id}, {_id: 0, __v: 0}).exec()

    return user ? {...user} : null
  }
}
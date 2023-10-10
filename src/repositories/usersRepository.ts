import {usersCollections} from "../db/db"
import {userSortedParams, UsersType, UserType} from "../types/generalTypes";
import {ViewUserModel} from "../features/users/models/ViewUserModel";
import {getPagesCount} from "../utils/utils";

export const usersRepository = {
  async getSortedUsers(params: userSortedParams): Promise<UsersType> {
    const {
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      skipSize
    } = params

    let findCondition = {}

    if (searchLoginTerm && !searchEmailTerm) {
      findCondition = { login: { $regex: searchLoginTerm, $options: 'i' }}
    }

    if (searchEmailTerm && !searchLoginTerm) {
      findCondition = { email: { $regex: searchEmailTerm, $options: 'i' }}
    }

    if (searchEmailTerm && searchLoginTerm) {
      findCondition = { $or: [
        { login: {$regex: searchLoginTerm, $options: 'i'} },
        { email: {$regex: searchEmailTerm, $options: 'i'} }
      ]}
    }

    const users = await usersCollections
      .find(findCondition, { projection: {_id: 0}})
      .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .toArray()

    const usersCount = await usersCollections.countDocuments(findCondition)

    const pagesCount = getPagesCount(usersCount , pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: usersCount,
      items: users.map(u => {
        return {
          id: u.id,
          email: u.email,
          login: u.login,
          createdAt: u.createdAt
        }
      })
    }
  },

  async loginUser(loginOrEmail: string): Promise<UserType | null> {
    return await usersCollections.findOne({
      $or: [
        { login: loginOrEmail },
        { email: loginOrEmail }
      ]
    })
  },

  async createUser(newUser: UserType): Promise<ViewUserModel> {
    await usersCollections.insertOne({...newUser})

    return {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    const result = await usersCollections.deleteOne({id})

    return result.deletedCount === 1
  }
}
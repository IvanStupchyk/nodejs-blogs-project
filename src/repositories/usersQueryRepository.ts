import {usersCollections} from "../db/db"
import {UsersType} from "../types/generalTypes";
import {createDefaultSortedParams, getPagesCount} from "../utils/utils";
import {GetSortedUsersModel} from "../features/users/models/GetSortedUsersModel";
import {mockUserModel} from "../constants/blanks";

export const usersQueryRepository = {
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
  }
}
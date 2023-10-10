import { v4 as uuidv4 } from 'uuid'
import {SortOrder} from "../constants/sortOrder";
import {mockUserModel} from "../constants/blanks";
import {countSkipSizeForDb} from "../utils/utils";
import {userSortedParams, UsersType, UserType} from "../types/generalTypes";
import bcrypt from 'bcrypt'
import {usersRepository} from "../repositories/usersRepository";
import {ViewUserModel} from "../features/users/models/ViewUserModel";
import {GetSortedUsersModel} from "../features/users/models/GetSortedUsersModel";

export const usersService = {
  async getSortedUsers(params: GetSortedUsersModel): Promise<UsersType> {
    const {
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize
    } = params

    const parsedPageNumber = parseInt(pageNumber)
    const parsedPageSize = parseInt(pageSize)
    const finalPageNumber = (!isNaN(parsedPageNumber) && parsedPageNumber > 0) ? parsedPageNumber : 1
    const finalPageSize = (!isNaN(parsedPageSize) && parsedPageSize > 0) ? parsedPageSize : 10
    const skipSize = countSkipSizeForDb(finalPageNumber, finalPageSize)

    const defaultParams: userSortedParams = {
      searchLoginTerm,
      searchEmailTerm,
      sortBy: mockUserModel.hasOwnProperty(sortBy) ? sortBy : 'createdAt',
      sortDirection: sortDirection === 'asc' ? sortDirection : SortOrder.desc,
      pageNumber: finalPageNumber,
      pageSize: finalPageSize,
      skipSize
    }

    return await usersRepository.getSortedUsers(defaultParams)
  },

  async createUser(login: string, password: string, email: string): Promise<ViewUserModel> {
    const passwordHash = await bcrypt.hash(password, 10)

    const newUser: UserType = {
      id: uuidv4(),
      login,
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    }

    return await usersRepository.createUser(newUser)
  },

  async deleteUser(id: string): Promise<boolean> {
    return await usersRepository.deleteUser(id)
  }
}
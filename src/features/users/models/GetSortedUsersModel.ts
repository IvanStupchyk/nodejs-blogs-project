import {SortOrder} from "../../../constants/sortOrder";
import {ViewUserModel} from "./ViewUserModel";

export type GetSortedUsersModel = {
  searchLoginTerm: string
  searchEmailTerm: string
  sortBy: keyof ViewUserModel
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: string
  pageSize: string
}
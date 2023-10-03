import {BlogType} from "../db/db";
import {SortOrder} from "../constants/sortOrder";

export type blogSortedParams = {
  searchNameTerm: string
  sortBy: keyof BlogType
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: number
  pageSize: number
}

export type postSortedParams = {
  sortBy: keyof BlogType
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: number
  pageSize: number
}
import {BlogType} from "../../../db/db";
import {SortOrder} from "../../../constants/sortOrder";

export type GetSortedBlogsModel = {
  searchNameTerm: string
  sortBy: keyof BlogType
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: string
  pageSize: string
}
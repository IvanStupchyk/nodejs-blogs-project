import {BlogType} from "../../../db/db";
import {SortOrder} from "../../../constants/sortOrder";

export type GetSortedPostsModel = {
  sortBy: keyof BlogType
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: string
  pageSize: string
}
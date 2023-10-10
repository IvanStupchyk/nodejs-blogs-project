import {SortOrder} from "../../../constants/sortOrder";
import {BlogType} from "../../../types/generalTypes";

export type GetSortedPostsModel = {
  sortBy: keyof BlogType
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: string
  pageSize: string
}
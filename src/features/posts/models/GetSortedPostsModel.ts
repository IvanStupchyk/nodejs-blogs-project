import {SortOrder} from "../../../constants/sortOrder";
import {PostType} from "../../../types/generalTypes";

export type GetSortedPostsModel = {
  sortBy: keyof PostType
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: string
  pageSize: string
}
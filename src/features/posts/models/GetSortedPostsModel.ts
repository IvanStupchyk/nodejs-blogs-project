import {SortOrder} from "../../../constants/sortOrder";
import {PostType} from "../../../dto/postDto";

export type GetSortedPostsModel = {
  sortBy: keyof PostType
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: string
  pageSize: string
}
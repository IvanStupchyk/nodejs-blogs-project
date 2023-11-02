import {SortOrder} from "../../../constants/sortOrder";
import {PostType} from "../../../domains/posts/dto/createPostDto";

export type GetSortedPostsModel = {
  sortBy: keyof PostType
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: string
  pageSize: string
}
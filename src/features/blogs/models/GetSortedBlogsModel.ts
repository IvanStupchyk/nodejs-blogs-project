import {SortOrder} from "../../../constants/sortOrder";
import {BlogType} from "../../../domains/blogs/dto/createBlogDto";

export type GetSortedBlogsModel = {
  searchNameTerm: string
  sortBy: keyof BlogType
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: string
  pageSize: string
}
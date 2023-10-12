import {SortOrder} from "../../../constants/sortOrder";
import {CommentViewModel} from "./CommentViewModel";

export type GetSortedCommentsModel = {
  searchNameTerm: string
  sortBy: keyof CommentViewModel
  sortDirection: SortOrder.asc | SortOrder.desc
  pageNumber: string
  pageSize: string
}
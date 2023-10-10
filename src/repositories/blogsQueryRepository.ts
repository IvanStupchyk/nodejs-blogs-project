import {blogsCollections} from "../db/db"
import {BlogsType, BlogType} from "../types/generalTypes";
import {createDefaultSortedParams, getPagesCount} from "../utils/utils";
import {SortOrder} from "../constants/sortOrder";
import {mockBlogModel} from "../constants/blanks";
import {GetSortedBlogsModel} from "../features/blogs/models/GetSortedBlogsModel";

export const blogsQueryRepository = {
  async getSortedBlogs(params: GetSortedBlogsModel): Promise<BlogsType> {
    const { searchNameTerm } = params

    const {
      pageNumber,
      pageSize,
      skipSize,
      sortBy,
      sortDirection
    } = createDefaultSortedParams({
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      model: mockBlogModel
    })

    const findCondition = searchNameTerm
      ? { name: {$regex: searchNameTerm, $options: 'i'} }
      : {}

    const blogs = await blogsCollections
      .find(findCondition, { projection: {_id: 0} })
      .sort({[sortBy]: sortDirection === SortOrder.asc ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .toArray()

    const blogsCount = await blogsCollections.countDocuments(findCondition)

    const pagesCount = getPagesCount(blogsCount , pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: [...blogs]
    }
  },

  async findBlogById(id: string): Promise<BlogType | null> {
    return blogsCollections.findOne({id}, { projection: {_id: 0}})
  }
}
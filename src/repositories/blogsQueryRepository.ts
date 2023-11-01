import {BlogModel} from "../db/db"
import {BlogsType, BlogType} from "../types/generalTypes";
import {createDefaultSortedParams, getPagesCount} from "../utils/utils";
import {SortOrder} from "../constants/sortOrder";
import {mockBlogModel} from "../constants/blanks";
import {GetSortedBlogsModel} from "../features/blogs/models/GetSortedBlogsModel";
import {ObjectId} from "mongodb";

export class BlogsQueryRepository {
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

    const blogsMongoose = await BlogModel
      .find(findCondition, {_id: 0, __v: 0})
      .sort({[sortBy]: sortDirection === SortOrder.asc ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .exec()

    const blogsCount = await BlogModel.countDocuments(findCondition)
    const pagesCount = getPagesCount(blogsCount , pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: [...blogsMongoose]
    }
  }

  async findBlogById(id: ObjectId): Promise<BlogType | null> {
    return await BlogModel.findOne({id}, {_id: 0, __v: 0}).exec()
  }
}
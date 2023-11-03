import {PostModel} from "../../db/db"
import {PostsType} from "../../types/generalTypes";
import {createDefaultSortedParams, getPagesCount} from "../../utils/utils";
import {GetSortedPostsModel} from "../../features/posts/models/GetSortedPostsModel";
import {mockPostModel} from "../../constants/blanks";
import {ObjectId} from "mongodb";
import 'reflect-metadata'
import {injectable} from "inversify";
import {PostType} from "../../dto/postDto";

@injectable()
export class PostsQueryRepository {
  async getSortedPosts(params: GetSortedPostsModel): Promise<PostsType> {
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
      model: mockPostModel
    })

    const posts = await PostModel
      .find({}, {_id: 0, __v: 0})
      .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .lean()

    const postsCount = await PostModel.countDocuments()

    const pagesCount = getPagesCount(postsCount, pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: [...posts]
    }
  }

  async findPostById(id: ObjectId): Promise<PostType | null> {
    return await PostModel.findOne({id}, {_id: 0, __v: 0}).exec()
  }

  async findPostsByIdForSpecificBlog(params: GetSortedPostsModel, id: string): Promise<PostsType | null> {
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
      model: mockPostModel
    })

    const posts = await PostModel
      .find({blogId: id}, {_id: 0, __v: 0})
      .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .lean()

    const postsCount = await PostModel.countDocuments({blogId: id})

    const pagesCount = getPagesCount(postsCount , pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: [...posts]
    }
  }
}
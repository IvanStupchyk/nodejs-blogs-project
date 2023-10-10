import {postsCollections} from "../db/db"
import {PostsType, PostType} from "../types/generalTypes";
import {createDefaultSortedParams, getPagesCount} from "../utils/utils";
import {GetSortedPostsModel} from "../features/posts/models/GetSortedPostsModel";
import {mockPostModel} from "../constants/blanks";

export const postsQueryRepository = {
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

    const posts = await postsCollections
      .find({}, { projection: {_id: 0}})
      .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .toArray()

    const postsCount = await postsCollections.countDocuments()

    const pagesCount = getPagesCount(postsCount, pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: [...posts]
    }
  },

  async findPostById(id: string): Promise<PostType | null> {
    return postsCollections.findOne({id}, { projection: {_id: 0}})
  },

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

    const posts = await postsCollections
      .find({blogId: id}, { projection: {_id: 0}})
      .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .toArray()

    const postsCount = await postsCollections.countDocuments({blogId: id})

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
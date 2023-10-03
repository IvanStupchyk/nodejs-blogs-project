import {v4 as uuidv4} from 'uuid'
import {mockPostModel, PostsType, PostType} from "../db/db"
import {postsRepository} from "../repositories/postsRepository";
import {SortOrder} from "../constants/sortOrder";
import {GetSortedPostsModel} from "../features/posts/models/GetSortedPostsModel";

export const postsService = {
  async getSortedPosts(params: GetSortedPostsModel): Promise<PostsType> {
    const {
      sortBy,
      sortDirection,
      pageNumber,
      pageSize
    } = params

    const parsedPageNumber = parseInt(pageNumber)
    const parsedPageSize = parseInt(pageSize)

    const defaultParams = {
      sortBy: mockPostModel.hasOwnProperty(sortBy) ? sortBy : 'createdAt',
      sortDirection: sortDirection === 'asc' ? sortDirection : SortOrder.desc,
      pageNumber: (!isNaN(parsedPageNumber) && parsedPageNumber > 0) ? parsedPageNumber : 1,
      pageSize: (!isNaN(parsedPageSize) && parsedPageSize > 0) ? parsedPageSize : 10
    }

    return await postsRepository.getSortedPosts(defaultParams)
  },

  async createPost(
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ): Promise<PostType> {
    const newPost: PostType = {
      id: uuidv4(),
      title,
      content,
      shortDescription,
      blogId,
      createdAt: new Date().toISOString(),
      blogName: ''
    }

    return await postsRepository.createPost(newPost, blogId)
  },

  async findPostById(id: string): Promise<PostType | null> {
    return await postsRepository.findPostById(id)
  },

  async findPostsByIdForSpecificBlog(
    params: GetSortedPostsModel,
    id: string
  ): Promise<PostsType | null> {
    const {
      sortBy,
      sortDirection,
      pageNumber,
      pageSize
    } = params

    const parsedPageNumber = parseInt(pageNumber)
    const parsedPageSize = parseInt(pageSize)

    const defaultParams = {
      sortBy: mockPostModel.hasOwnProperty(sortBy) ? sortBy : 'createdAt',
      sortDirection: sortDirection === 'asc' ? sortDirection : SortOrder.desc,
      pageNumber: (!isNaN(parsedPageNumber) && parsedPageNumber > 0) ? parsedPageNumber : 1,
      pageSize: (!isNaN(parsedPageSize) && parsedPageSize > 0) ? parsedPageSize : 10
    }
    return await postsRepository.findPostsByIdForSpecificBlog(defaultParams, id)
  },

  async updatePostById(
    id: string,
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ): Promise<boolean> {
    return await postsRepository.updatePostById(
      id,
      title,
      content,
      shortDescription,
      blogId
    )
  },

  async deletePost(id: string): Promise<boolean> {
    return await postsRepository.deletePost(id)
  }
}
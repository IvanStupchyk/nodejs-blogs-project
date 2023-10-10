import {blogsCollections, postsCollections} from "../db/db"
import {postSortedParams, PostsType, PostType} from "../types/generalTypes";

export const postsRepository = {
  async getSortedPosts(params: postSortedParams): Promise<PostsType> {
    const {
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      skipSize
    } = params

    const posts = await postsCollections
      .find({}, { projection: {_id: 0}})
      .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .toArray()

    const postsCount = await postsCollections.countDocuments()

    const pagesCount = Math.ceil(postsCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: posts
    }
  },

  async createPost(
    newPost: PostType,
    blogId: string
  ): Promise<PostType> {
    const linkedBlog = await blogsCollections.findOne({id: blogId})

    const newPostWithBlogName: PostType = {
      id: newPost.id,
      title: newPost.title,
      content: newPost.content,
      shortDescription: newPost.shortDescription,
      blogId: newPost.blogId,
      createdAt: newPost.createdAt,
      blogName: linkedBlog?.name ?? ''
    }

    await postsCollections.insertOne({...newPostWithBlogName})

    return {...newPostWithBlogName}
  },

  async findPostById(id: string): Promise<PostType | null> {
    return postsCollections.findOne({id}, { projection: {_id: 0}})
  },

  async findPostsByIdForSpecificBlog(params: postSortedParams, id: string): Promise<PostsType | null> {
    const {
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      skipSize
    } = params

    const posts = await postsCollections
      .find({blogId: id}, { projection: {_id: 0}})
      .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .toArray()

    const postsCount = (await postsCollections
      .find({blogId: id})
      .toArray())
      .length

    const pagesCount = Math.ceil(postsCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: posts
    }
  },

  async updatePostById(
    id: string,
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ): Promise<boolean> {
    const linkedBlog = await blogsCollections.findOne({id: blogId})

    const result = await postsCollections.updateOne({id}, {
      $set: {
        title,
        content,
        shortDescription,
        blogId,
        blogName: linkedBlog?.name ?? ''
      }
    })

    return result.matchedCount === 1
  },

  async deletePost(id: string): Promise<boolean> {
    const deletedPost = await postsCollections.deleteOne({id})

    return deletedPost.deletedCount === 1
  }
}
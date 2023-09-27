import { v4 as uuidv4 } from 'uuid'
import {blogsCollections, postsCollections, PostsType, PostType} from "../db/db"

export const postsRepository = {
  async getAllPosts(): Promise<PostsType> {
    return postsCollections.find({}, { projection: {_id: 0}}).toArray()
  },

  async createPost(
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ): Promise<PostType> {
    const linkedBlog = await blogsCollections.findOne({id: blogId})

    const newPost: PostType = {
      id: uuidv4(),
      title,
      content,
      shortDescription,
      blogId,
      createdAt: new Date().toISOString(),
      blogName: linkedBlog?.name ?? ''
    }

    await postsCollections.insertOne({...newPost})

    return {...newPost}
  },

  async findPostById(id: string): Promise<PostType | null> {
    return postsCollections.findOne({id}, { projection: {_id: 0}})
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
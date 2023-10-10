import {blogsCollections, postsCollections} from "../db/db"
import {PostType} from "../types/generalTypes";

export const postsRepository = {

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
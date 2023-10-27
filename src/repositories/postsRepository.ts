import {BlogModel, PostModel} from "../db/db"
import {BlogType, PostType} from "../types/generalTypes";

export const postsRepository = {
  async createPost(
    newPost: PostType,
    blogId: string
  ): Promise<PostType> {
    const linkedBlog: BlogType | null = await BlogModel
      .findOne({id: blogId}, {_id: 0, __v: 0})
      .lean()

    const postInstance = new PostModel()

    postInstance.id = newPost.id
    postInstance.title = newPost.title
    postInstance.content = newPost.content
    postInstance.shortDescription = newPost.shortDescription
    postInstance.blogId = newPost.blogId
    postInstance.createdAt = newPost.createdAt
    postInstance.blogName = linkedBlog?.name ?? ''

    await postInstance.save()

    return {
      id: postInstance.id,
      title: postInstance.title,
      content: postInstance.content,
      shortDescription: postInstance.shortDescription,
      blogId: postInstance.blogId,
      createdAt: postInstance.createdAt,
      blogName: postInstance.blogName,
    }
  },

  async updatePostById(
    id: string,
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ): Promise<boolean> {
    const linkedBlog: BlogType | null = await BlogModel
      .findOne({id: blogId}, {_id: 0, __v: 0})
      .lean()

    const result = await PostModel.findOneAndUpdate({id}, {
      $set: {
        title,
        content,
        shortDescription,
        blogId,
        blogName: linkedBlog?.name ?? ''
      }
    })

    return !!result
  },

  async deletePost(id: string): Promise<boolean> {
    const deletedPost = await PostModel.deleteOne({id}).exec()

    return deletedPost.deletedCount === 1
  }
}
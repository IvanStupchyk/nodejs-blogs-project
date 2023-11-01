import {BlogModel} from "../db/db"
import {BlogType} from "../types/generalTypes";

export class BlogsRepository {
  async createBlog(newBlog: BlogType): Promise<BlogType> {
    const blogInstance = new BlogModel()

    blogInstance.id = newBlog.id
    blogInstance.name = newBlog.name
    blogInstance.description = newBlog.description
    blogInstance.websiteUrl = newBlog.websiteUrl
    blogInstance.createdAt = newBlog.createdAt
    blogInstance.isMembership = newBlog.isMembership

    await blogInstance.save()

    return {...newBlog}
  }

  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string
  ): Promise<boolean> {
    const result = await BlogModel.findOneAndUpdate({id}, {
      $set: {
        name,
        description,
        websiteUrl
      }
    })

    return !!result
  }

  async deleteBlog(id: string): Promise<boolean> {
    const result = await BlogModel.deleteOne({id}).exec()

    return result.deletedCount === 1
  }
}
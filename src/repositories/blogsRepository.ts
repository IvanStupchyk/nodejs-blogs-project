import {blogsCollections} from "../db/db"
import {BlogType} from "../types/generalTypes";

export const blogsRepository = {
  async createBlog(newBlog: BlogType): Promise<BlogType> {
    await blogsCollections.insertOne({...newBlog})

    return {...newBlog}
  },

  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string
  ): Promise<boolean> {
    const result = await blogsCollections.updateOne({id}, {
      $set: {
        name,
        description,
        websiteUrl
      }
    })

    return result.matchedCount === 1
  },

  async deleteBlog(id: string): Promise<boolean> {
    const result = await blogsCollections.deleteOne({id})

    return result.deletedCount === 1
  }
}
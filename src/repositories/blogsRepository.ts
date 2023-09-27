import { v4 as uuidv4 } from 'uuid'
import {blogsCollections, BlogsType, BlogType} from "../db/db"

export const blogsRepository = {
  async getAllPBlogs(): Promise<BlogsType> {
    return blogsCollections.find({}, { projection: {_id: 0}}).toArray()
  },

  async createBlog(name: string, description: string, websiteUrl: string): Promise<BlogType> {
    const newBlog: BlogType = {
      id: uuidv4(),
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false
    }

    await blogsCollections.insertOne({...newBlog})

    return {...newBlog}
  },

  async findBlogById(id: string): Promise<BlogType | null> {
    return blogsCollections.findOne({id}, { projection: {_id: 0}})
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
import { v4 as uuidv4 } from 'uuid'
import {blogsRepository} from "../repositories/blogsRepository";
import {BlogType} from "../types/generalTypes";

export const blogsService = {
  async createBlog(name: string, description: string, websiteUrl: string): Promise<BlogType> {
    const newBlog: BlogType = {
      id: uuidv4(),
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false
    }

    return await blogsRepository.createBlog(newBlog)
  },

  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string
  ): Promise<boolean> {
    return await blogsRepository.updateBlogById(
      id,
      name,
      description,
      websiteUrl
    )
  },

  async deleteBlog(id: string): Promise<boolean> {
    return await blogsRepository.deleteBlog(id)
  }
}
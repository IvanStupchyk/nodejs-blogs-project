import {blogsRepository} from "../repositories/blogsRepository";
import {BlogType} from "../types/generalTypes";
import {ObjectId} from "mongodb";
import {blogsQueryRepository} from "../repositories/blogsQueryRepository";

export const blogsService = {
  async createBlog(name: string, description: string, websiteUrl: string): Promise<BlogType> {
    const newBlog: BlogType = {
      id: new ObjectId(),
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

  async findBlogById(id: string): Promise<BlogType | null> {
    if (!ObjectId.isValid(id)) return null
    return await blogsQueryRepository.findBlogById(new ObjectId(id))
  },

  async deleteBlog(id: string): Promise<boolean> {
    return await blogsRepository.deleteBlog(id)
  }
}
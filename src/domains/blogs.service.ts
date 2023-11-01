import {BlogsRepository} from "../repositories/blogsRepository";
import {BlogType} from "../types/generalTypes";
import {ObjectId} from "mongodb";
import {BlogsQueryRepository} from "../repositories/blogsQueryRepository";

export class BlogsService  {
  constructor(protected blogsRepository: BlogsRepository,
              protected blogsQueryRepository: BlogsQueryRepository
  ) {}

  async createBlog(name: string, description: string, websiteUrl: string): Promise<BlogType> {
    const newBlog: BlogType = new BlogType(
      new ObjectId(),
      name,
      description,
      websiteUrl,
      new Date().toISOString(),
      false
  )

    return await this.blogsRepository.createBlog(newBlog)
  }

  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string
  ): Promise<boolean> {
    return await this.blogsRepository.updateBlogById(
      id,
      name,
      description,
      websiteUrl
    )
  }

  async findBlogById(id: string): Promise<BlogType | null> {
    if (!ObjectId.isValid(id)) return null
    return await this.blogsQueryRepository.findBlogById(new ObjectId(id))
  }

  async deleteBlog(id: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlog(id)
  }
}
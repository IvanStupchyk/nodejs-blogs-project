import { v4 as uuidv4 } from 'uuid'
import {BlogsType, BlogType, mockBlogModel} from "../db/db"
import {blogsRepository} from "../repositories/blogsRepository";
import {GetSortedBlogsModel} from "../features/blogs/models/GetSortedBlogsModel";
import {SortOrder} from "../constants/sortOrder";

export const blogsService = {
  async getSortedBlogs(params: GetSortedBlogsModel): Promise<BlogsType> {
    const {
      searchNameTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize
    } = params

    const parsedPageNumber = parseInt(pageNumber)
    const parsedPageSize = parseInt(pageSize)

    const defaultParams = {
      searchNameTerm,
      sortBy: mockBlogModel.hasOwnProperty(sortBy) ? sortBy : 'createdAt',
      sortDirection: sortDirection === 'asc' ? sortDirection : SortOrder.desc,
      pageNumber: (!isNaN(parsedPageNumber) && parsedPageNumber > 0) ? parsedPageNumber : 1,
      pageSize: (!isNaN(parsedPageSize) && parsedPageSize > 0) ? parsedPageSize : 10
    }

    return await blogsRepository.getSortedBlogs(defaultParams)
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

    return await blogsRepository.createBlog(newBlog)
  },

  async findBlogById(id: string): Promise<BlogType | null> {
    return await blogsRepository.findBlogById(id)
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
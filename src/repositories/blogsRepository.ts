import {blogsCollections, BlogsType, BlogType} from "../db/db"
import {blogSortedParams} from "../types/generalTypes";

export const blogsRepository = {
  async getSortedBlogs(params: blogSortedParams): Promise<BlogsType> {
    const {
      searchNameTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      skipSize
    } = params

    const findCondition = searchNameTerm
      ? { name: {$regex: searchNameTerm, $options: 'i'} }
      : {}

    const blogs = await blogsCollections
      .find(findCondition, { projection: {_id: 0}})
      .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .toArray()

    const blogsCount = (await blogsCollections
      .find(findCondition, {projection: {_id: 0}})
      .toArray())
      .length

    const pagesCount = Math.ceil(blogsCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: blogs
    }
  },

  async createBlog(newBlog: BlogType): Promise<BlogType> {
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
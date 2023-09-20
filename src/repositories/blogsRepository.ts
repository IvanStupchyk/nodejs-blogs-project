import { v4 as uuidv4 } from 'uuid'
import {BlogType, db} from "../db/db"

export const blogsRepository = {
  createBlog(name: string, description: string, websiteUrl: string) {
    const newBlog: BlogType = {
      id: uuidv4(),
      name,
      description,
      websiteUrl
    }

    db.blogs.push(newBlog)

    return newBlog
  },

  findBlogById(id: string) {
    return db.blogs.find(b => b.id === id)
  },

  updateBlogById(id: string, name: string, description: string, websiteUrl: string) {
    const foundBlog = db.blogs.find(b => b.id === id)

    if (foundBlog) {
      foundBlog.name = name
      foundBlog.description = description
      foundBlog.websiteUrl = websiteUrl
      return true
    }

    return false
  },

  deleteBlog(id: string) {
    const blogIndex = db.blogs.findIndex(b => b.id === id)


    if (blogIndex > -1) {
      db.blogs.splice(blogIndex, 1)
      return true
    }

    return false
  }
}
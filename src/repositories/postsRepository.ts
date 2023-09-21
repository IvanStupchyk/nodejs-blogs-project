import { v4 as uuidv4 } from 'uuid'
import { db, PostType} from "../db/db"

export const postsRepository = {
  createPost(
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ) {
    const linkedBlog = db.blogs.find(b => b.id === blogId)

    const newPost: PostType = {
      id: uuidv4(),
      title,
      content,
      shortDescription,
      blogId,
      blogName: linkedBlog ? linkedBlog.name : ''
    }

    db.posts.push(newPost)

    return newPost
  },

  findPostById(id: string) {
    return db.posts.find(b => b.id === id)
  },

  updatePostById(
    id: string,
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ) {
    const foundPost = db.posts.find(b => b.id === id)
    const linkedBlog = db.blogs.find(b => b.id === blogId)
    if (foundPost) {
      foundPost.title = title
      foundPost.content = content
      foundPost.shortDescription = shortDescription
      foundPost.blogId = blogId
      foundPost.blogName = linkedBlog ? linkedBlog.name : ''
      return true
    }

    return false
  },

  deletePost(id: string) {
    const postIndex = db.posts.findIndex(b => b.id === id)

    if (postIndex > -1) {
      db.posts.splice(postIndex, 1)
      return true
    }

    return false
  }
}
import {v4 as uuidv4} from 'uuid'
import {postsRepository} from "../repositories/postsRepository";
import {PostType} from "../types/generalTypes";

export const postsService = {
  async createPost(
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ): Promise<PostType> {
    const newPost: PostType = {
      id: uuidv4(),
      title,
      content,
      shortDescription,
      blogId,
      createdAt: new Date().toISOString(),
      blogName: ''
    }

    return await postsRepository.createPost(newPost, blogId)
  },

  async updatePostById(
    id: string,
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ): Promise<boolean> {
    return await postsRepository.updatePostById(
      id,
      title,
      content,
      shortDescription,
      blogId
    )
  },

  async deletePost(id: string): Promise<boolean> {
    return await postsRepository.deletePost(id)
  }
}
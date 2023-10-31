import {postsRepository} from "../repositories/postsRepository";
import {PostType} from "../types/generalTypes";
import {ObjectId} from "mongodb";
import {postsQueryRepository} from "../repositories/postsQueryRepository";

export const postsService = {
  async createPost(
    title: string,
    content: string,
    shortDescription: string,
    blogId: ObjectId
  ): Promise<PostType> {
    const newPost: PostType = {
      id: new ObjectId(),
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

  async findPostById(id: string): Promise<PostType | null> {
    if (!ObjectId.isValid(id)) return null
    return await postsQueryRepository.findPostById(new ObjectId(id))
  },

  async deletePost(id: string): Promise<boolean> {
    return await postsRepository.deletePost(id)
  }
}
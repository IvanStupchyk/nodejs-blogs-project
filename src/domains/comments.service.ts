import {v4 as uuidv4} from 'uuid'
import {CommentType} from "../types/generalTypes";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";
import {commentsRepository} from "../repositories/comentsRepository";

export const commentsService = {
  async createComment(
    content: string,
    id: string,
    userId: string,
    userLogin: string
  ): Promise<CommentViewModel> {
    const newComment: CommentType = {
      id: uuidv4(),
      content,
      postId: id,
      commentatorInfo: {
        userId,
        userLogin
      },
      createdAt: new Date().toISOString(),
    }

    return await commentsRepository.createComment(newComment)
  },

  async updateComment(
    content: string,
    id: string
  ): Promise<boolean> {
    return await commentsRepository.updateComment(content, id)
  },

  async deleteComment(commentId: string): Promise<boolean> {
    return await commentsRepository.deleteComment(commentId)
  }
}
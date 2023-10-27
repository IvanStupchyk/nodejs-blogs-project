import {CommentModel} from "../db/db"
import {CommentType} from "../types/generalTypes";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";

export const commentsRepository = {
  async createComment(comment: CommentType): Promise<CommentViewModel> {
    const commentInstance = new CommentModel()

    commentInstance.id = comment.id
    commentInstance.content = comment.content
    commentInstance.postId = comment.postId
    commentInstance.commentatorInfo = comment.commentatorInfo
    commentInstance.createdAt = comment.createdAt

    await commentInstance.save()

    return {
      id: commentInstance.id,
      content: commentInstance.content,
      commentatorInfo: {
        userId: commentInstance.commentatorInfo.userId,
        userLogin: commentInstance.commentatorInfo.userLogin
      },
      createdAt: commentInstance.createdAt
    }
  },

  async updateComment(content: string, id: string): Promise<boolean> {
    const result = await CommentModel
      .updateOne({id}, {$set: {content}}).exec()

    return result.matchedCount === 1
  },

  async deleteComment(id: string): Promise<boolean> {
    const result = await CommentModel
      .deleteOne({id}).exec()

    return result.deletedCount === 1
  }
}
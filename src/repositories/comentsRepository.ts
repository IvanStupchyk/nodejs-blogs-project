import {commentsCollections} from "../db/db"
import {CommentType} from "../types/generalTypes";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";

export const commentsRepository = {
  async createComment(comment: CommentType): Promise<CommentViewModel> {
    await commentsCollections.insertOne({...comment})

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin
      },
      createdAt: comment.createdAt
    }
  },

  async updateComment(content: string, id: string): Promise<boolean> {
    const result = await commentsCollections
      .updateOne({id}, {$set: {content}})

    return result.matchedCount === 1
  },

  async deleteComment(id: string): Promise<boolean> {
    const result = await commentsCollections
      .deleteOne({id})

    return result.deletedCount === 1
  }
}
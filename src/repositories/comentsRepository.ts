import {CommentModel} from "../db/db"
import {CommentLikesInfoType, CommentStatus, CommentType} from "../types/generalTypes";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";

export const commentsRepository = {
  async createComment(comment: CommentType): Promise<CommentViewModel> {
    const commentInstance = new CommentModel()

    commentInstance.id = comment.id
    commentInstance.content = comment.content
    commentInstance.postId = comment.postId
    commentInstance.commentatorInfo = comment.commentatorInfo
    commentInstance.likesInfo = comment.likesInfo
    commentInstance.createdAt = comment.createdAt

    await commentInstance.save()

    return {
      id: commentInstance.id,
      content: commentInstance.content,
      commentatorInfo: {
        userId: commentInstance.commentatorInfo.userId,
        userLogin: commentInstance.commentatorInfo.userLogin
      },
      likesInfo: {
        likesCount: commentInstance.likesInfo.likesCount,
        dislikesCount: commentInstance.likesInfo.dislikesCount,
        myStatus: CommentStatus.None
      },
      createdAt: commentInstance.createdAt
    }
  },

  async updateComment(content: string, id: string): Promise<boolean> {
    const result = await CommentModel
      .updateOne({id}, {$set: {content}}).exec()

    return result.matchedCount === 1
  },

  async changeLikesCount(id: string, likesInfo: CommentLikesInfoType): Promise<boolean> {
    const result = await CommentModel
      .updateOne(
        {id},
        {$set: {likesInfo}})
      .exec()

    return result.matchedCount === 1
  },

  async deleteComment(id: string): Promise<boolean> {
    const result = await CommentModel
      .deleteOne({id}).exec()

    return result.deletedCount === 1
  }
}
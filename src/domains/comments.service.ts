import {v4 as uuidv4} from 'uuid'
import {CommentStatus, CommentType} from "../types/generalTypes";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";
import {commentsRepository} from "../repositories/comentsRepository";
import {commentsQueryRepository} from "../repositories/comentsQueryRepository";
import {jwtService} from "../application/jwt-service";
import {usersQueryRepository} from "../repositories/usersQueryRepository";

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
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0
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

  async findCommentById(
    commentId: string,
    refreshToken: string
  ): Promise<CommentViewModel | null> {
    const userId = await jwtService.getUserIdByRefreshToken(refreshToken)

    let finalCommentStatus = CommentStatus.None

    if (userId) {
      const userCommentsLikes = await usersQueryRepository.findUserCommentLikesById(userId)

      if (Array.isArray(userCommentsLikes) && userCommentsLikes.length) {
        const initialCommentData = userCommentsLikes
          .find(c => c.commentId === commentId)

        if (initialCommentData) {
          finalCommentStatus = initialCommentData.myStatus
        }
      }
    }

    console.log('userId', userId)
    console.log('finalCommentStatus', finalCommentStatus)

    return await commentsQueryRepository.findCommentById(commentId, finalCommentStatus)
  },

  async changeLikesCount(
    id: string,
    myStatus: string
  ): Promise<boolean> {
    const foundComment = await commentsQueryRepository.findCommentById(id)
    if (!foundComment) return false

    const likesInfo = {...foundComment.likesInfo}
    let counter = 0
    console.log('counter', counter)
    switch (myStatus) {
      case 'Like':
        counter = ++counter
        likesInfo.likesCount = ++likesInfo.likesCount
        likesInfo.myStatus = CommentStatus.Like
        break
      case 'Dislike':
        likesInfo.dislikesCount = ++likesInfo.dislikesCount
        likesInfo.myStatus = CommentStatus.Dislike
        break
      case 'None':
        likesInfo.dislikesCount = 0
        likesInfo.likesCount = 0
        likesInfo.myStatus = CommentStatus.None
        break
      default: return false
    }

    return await commentsRepository.changeLikesCount(id, likesInfo)
  },

  async deleteComment(commentId: string): Promise<boolean> {
    return await commentsRepository.deleteComment(commentId)
  }
}
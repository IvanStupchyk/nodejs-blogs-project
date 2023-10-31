import {v4 as uuidv4} from 'uuid'
import {CommentStatus, CommentsType, CommentType} from "../types/generalTypes";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";
import {commentsRepository} from "../repositories/comentsRepository";
import {commentsQueryRepository} from "../repositories/comentsQueryRepository";
import {jwtService} from "../application/jwt-service";
import {usersQueryRepository} from "../repositories/usersQueryRepository";
import {usersRepository} from "../repositories/usersRepository";
import {GetSortedCommentsModel} from "../features/comments/models/GetSortedCommentsModel";
import {postsQueryRepository} from "../repositories/postsQueryRepository";

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

    let finalCommentStatus = CommentStatus.Dislike

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

    return await commentsQueryRepository.findCommentById(commentId, finalCommentStatus)
  },

  async changeLikesCount(
    id: string,
    myStatus: string,
    userId: string
  ): Promise<boolean> {
    const foundComment = await commentsQueryRepository.findCommentById(id)
    if (!foundComment) return false

    const likesInfo = {...foundComment.likesInfo}
    let userCommentsLikes = await usersQueryRepository.findUserCommentLikesById(userId)
    let initialCommentData

    if (Array.isArray(userCommentsLikes) && userCommentsLikes.length) {
      initialCommentData = userCommentsLikes
        .find(c => c.commentId === id)
    }

    if (initialCommentData?.myStatus === myStatus) return true

    let newStatus: CommentStatus = CommentStatus.None

    if (initialCommentData?.myStatus) {
      if (myStatus === 'Like' && initialCommentData?.myStatus === 'Dislike') {
        likesInfo.likesCount = ++likesInfo.likesCount
        likesInfo.dislikesCount = --likesInfo.dislikesCount
        newStatus = CommentStatus.Like
      }

      if (myStatus === 'Like' && initialCommentData?.myStatus === 'None') {
        likesInfo.likesCount = ++likesInfo.likesCount
        newStatus = CommentStatus.Like
      }

      if (myStatus === 'Dislike' && initialCommentData?.myStatus === 'Like') {
        likesInfo.dislikesCount = ++likesInfo.dislikesCount
        likesInfo.likesCount = --likesInfo.likesCount
        newStatus = CommentStatus.Dislike
      }

      if (myStatus === 'Dislike' && initialCommentData?.myStatus === 'None') {
        likesInfo.dislikesCount = ++likesInfo.dislikesCount
        newStatus = CommentStatus.Dislike
      }

      if (myStatus === 'None' && initialCommentData?.myStatus === 'Like') {
        likesInfo.likesCount = --likesInfo.likesCount
        newStatus = CommentStatus.None
      }

      if (myStatus === 'None' && initialCommentData?.myStatus === 'Dislike') {
        likesInfo.dislikesCount = --likesInfo.dislikesCount
        newStatus = CommentStatus.None
      }
    } else {
      switch (myStatus) {
        case 'Like':
          likesInfo.likesCount = ++likesInfo.likesCount
          newStatus = CommentStatus.Like
          break
        case 'Dislike':
          likesInfo.dislikesCount = ++likesInfo.dislikesCount
          newStatus = CommentStatus.Dislike
          break
        default: return true
      }
    }

    if (initialCommentData?.myStatus) {
      await usersRepository.updateExistingUserCommentLike(userId, newStatus, id)
    } else {
      await usersRepository.setNewUserCommentLike(userId, newStatus, id)
    }

    return await commentsRepository.changeLikesCount(id, likesInfo)
  },

  async getSortedComments(
    id: string,
    query: GetSortedCommentsModel,
    refreshTokenCookie: string | undefined
  ): Promise<CommentsType | boolean>  {
    const foundPost = await postsQueryRepository.findPostById(id)
    if (!foundPost) return false

    let userId
    if (refreshTokenCookie) {
      const result: any = await jwtService.verifyRefreshToken(refreshTokenCookie)
      userId = result?.userId
    }

    return  await commentsQueryRepository.getSortedComments(query, id, userId)
  },

  async deleteComment(commentId: string): Promise<boolean> {
    return await commentsRepository.deleteComment(commentId)
  }
}
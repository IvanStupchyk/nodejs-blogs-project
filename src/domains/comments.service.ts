import {CommentStatus, CommentsType, CommentType} from "../types/generalTypes";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";
import {commentsRepository} from "../repositories/comentsRepository";
import {commentsQueryRepository} from "../repositories/comentsQueryRepository";
import {jwtService} from "../application/jwt-service";
import {usersQueryRepository} from "../repositories/usersQueryRepository";
import {usersRepository} from "../repositories/usersRepository";
import {GetSortedCommentsModel} from "../features/comments/models/GetSortedCommentsModel";
import {postsQueryRepository} from "../repositories/postsQueryRepository";
import {ObjectId} from "mongodb";

export const commentsService = {
  async createComment(
    content: string,
    id: ObjectId,
    userId: ObjectId,
    userLogin: string
  ): Promise<CommentViewModel> {
    const newComment: CommentType = {
      id: new ObjectId(),
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
    accessTokenHeader: string | undefined
  ): Promise<CommentViewModel | null> {
    if (!ObjectId.isValid(commentId)) return null
    const commentObjectId = new ObjectId(commentId)

    let userId
    if (accessTokenHeader) {
      const accessToken = accessTokenHeader.split(' ')[1]
      userId = await jwtService.getUserIdByAccessToken(accessToken)
    }

    let finalCommentStatus = CommentStatus.None

    if (userId) {
      const userCommentsLikes = await usersQueryRepository.findUserCommentLikesById(userId)

      if (Array.isArray(userCommentsLikes) && userCommentsLikes.length) {
        const initialCommentData = userCommentsLikes
          .find(c => new ObjectId(c.commentId).equals(commentObjectId))

        if (initialCommentData) {
          finalCommentStatus = initialCommentData.myStatus
        }
      }
    }

    return await commentsQueryRepository.findCommentById(commentObjectId, finalCommentStatus)
  },

  async changeLikesCount(
    id: string,
    myStatus: string,
    userId: ObjectId
  ): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false
    const commentObjectId = new ObjectId(id)
    const foundComment = await commentsQueryRepository.findCommentById(commentObjectId)
    if (!foundComment) return false

    const likesInfo = {...foundComment.likesInfo}
    let userCommentsLikes = await usersQueryRepository.findUserCommentLikesById(userId)
    let initialCommentData

    if (Array.isArray(userCommentsLikes) && userCommentsLikes.length) {
      initialCommentData = userCommentsLikes
        .find(c => new ObjectId(c.commentId).equals(commentObjectId))
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
      await usersRepository.updateExistingUserCommentLike(userId, newStatus, commentObjectId)
    } else {
      await usersRepository.setNewUserCommentLike(userId, newStatus, commentObjectId, new Date().toISOString())
    }

    return await commentsRepository.changeLikesCount(id, likesInfo)
  },

  async getSortedComments(
    id: string,
    query: GetSortedCommentsModel,
    accessTokenHeader: string | undefined
  ): Promise<CommentsType | boolean>  {
    if (!ObjectId.isValid(id)) return false
    const postObjectId = new ObjectId(id)

    const foundPost = await postsQueryRepository.findPostById(postObjectId)
    if (!foundPost) return false

    let userId
    if (accessTokenHeader) {
      const accessToken = accessTokenHeader.split(' ')[1]
      userId = await jwtService.getUserIdByAccessToken(accessToken)
    }

    return  await commentsQueryRepository.getSortedComments(query, postObjectId, userId)
  },

  async findCommentByIdWithoutLikeStatus(id: string): Promise<CommentViewModel | null> {
    if (!ObjectId.isValid(id)) return null
    return await commentsQueryRepository.findCommentById(new ObjectId(id))
  },

  async deleteComment(commentId: string): Promise<boolean> {
    return await commentsRepository.deleteComment(commentId)
  }
}
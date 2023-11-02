import {CommentStatus, CommentsType, CommentType} from "../types/generalTypes";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";
import {CommentsRepository} from "../repositories/comentsRepository";
import {CommentsQueryRepository} from "../repositories/comentsQueryRepository";
import {jwtService} from "../application/jwt-service";
import {UsersQueryRepository} from "../repositories/usersQueryRepository";
import {UsersRepository} from "../repositories/usersRepository";
import {GetSortedCommentsModel} from "../features/comments/models/GetSortedCommentsModel";
import {PostsQueryRepository} from "../repositories/postsQueryRepository";
import {ObjectId} from "mongodb";
import {inject, injectable} from "inversify";

@injectable()
export class CommentsService {
  constructor(  @inject(UsersQueryRepository) protected usersQueryRepository: UsersQueryRepository,
                @inject(UsersRepository) protected usersRepository: UsersRepository,
                @inject(CommentsRepository) protected commentsRepository: CommentsRepository,
                @inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository,
                @inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository
  ) {}

  async createComment(
    content: string,
    id: ObjectId,
    userId: ObjectId,
    userLogin: string
  ): Promise<CommentViewModel> {

    const newComment: CommentType = new CommentType(
      new ObjectId(),
      content,
      id,
      {
        userId,
        userLogin
      },
      {
        likesCount: 0,
        dislikesCount: 0
      },
      new Date().toISOString()
  )

    return await this.commentsRepository.createComment(newComment)
  }

  async updateComment(
    content: string,
    id: string
  ): Promise<boolean> {
    return await this.commentsRepository.updateComment(content, id)
  }

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
      const userCommentsLikes = await this.usersQueryRepository.findUserCommentLikesById(userId)

      if (Array.isArray(userCommentsLikes) && userCommentsLikes.length) {
        const initialCommentData = userCommentsLikes
          .find(c => new ObjectId(c.commentId).equals(commentObjectId))

        if (initialCommentData) {
          finalCommentStatus = initialCommentData.myStatus
        }
      }
    }

    return await this.commentsQueryRepository.findCommentById(commentObjectId, finalCommentStatus)
  }

  async changeLikesCount(
    id: string,
    myStatus: string,
    userId: ObjectId
  ): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false
    const commentObjectId = new ObjectId(id)
    const foundComment = await this.commentsQueryRepository.findCommentById(commentObjectId)
    if (!foundComment) return false

    const likesInfo = {...foundComment.likesInfo}
    let userCommentsLikes = await this.usersQueryRepository.findUserCommentLikesById(userId)
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
      await this.usersRepository.updateExistingUserCommentLike(userId, newStatus, commentObjectId)
    } else {
      await this.usersRepository.setNewUserCommentLike(userId, newStatus, commentObjectId, new Date().toISOString())
    }

    return await this.commentsRepository.changeLikesCount(id, likesInfo)
  }

  async getSortedComments(
    id: string,
    query: GetSortedCommentsModel,
    accessTokenHeader: string | undefined
  ): Promise<CommentsType | boolean>  {
    if (!ObjectId.isValid(id)) return false
    const postObjectId = new ObjectId(id)

    const foundPost = await this.postsQueryRepository.findPostById(postObjectId)
    if (!foundPost) return false

    let userId
    if (accessTokenHeader) {
      const accessToken = accessTokenHeader.split(' ')[1]
      userId = await jwtService.getUserIdByAccessToken(accessToken)
    }

    return  await this.commentsQueryRepository.getSortedComments(query, postObjectId, userId)
  }

  async findCommentByIdWithoutLikeStatus(id: string): Promise<CommentViewModel | null> {
    if (!ObjectId.isValid(id)) return null
    return await this.commentsQueryRepository.findCommentById(new ObjectId(id))
  }

  async deleteComment(commentId: string): Promise<boolean> {
    return await this.commentsRepository.deleteComment(commentId)
  }
}
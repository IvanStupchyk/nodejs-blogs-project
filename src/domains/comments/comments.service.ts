import {likeStatus, CommentsType} from "../../types/generalTypes";
import {CommentViewModel} from "../../features/comments/models/CommentViewModel";
import {CommentsRepository} from "../../infrastructure/repositories/comentsRepository";
import {CommentsQueryRepository} from "../../infrastructure/repositories/comentsQueryRepository";
import {jwtService} from "../../application/jwt-service";
import {UsersQueryRepository} from "../../infrastructure/repositories/usersQueryRepository";
import {UsersRepository} from "../../infrastructure/repositories/usersRepository";
import {GetSortedCommentsModel} from "../../features/comments/models/GetSortedCommentsModel";
import {PostsQueryRepository} from "../../infrastructure/repositories/postsQueryRepository";
import {ObjectId} from "mongodb";
import {inject, injectable} from "inversify";
import {CommentType} from "./dto/createCommentDto";
import {likesCounter} from "../../utils/likesCounter";

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

    let finalCommentStatus = likeStatus.None

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

    let userCommentsLikes = await this.usersQueryRepository.findUserCommentLikesById(userId)
    let initialCommentData

    if (Array.isArray(userCommentsLikes) && userCommentsLikes.length) {
      initialCommentData = userCommentsLikes
        .find(c => new ObjectId(c.commentId).equals(commentObjectId))
    }

    if (initialCommentData?.myStatus === myStatus) return true

    const {likesInfo, newStatus} = likesCounter(
      myStatus,
      likeStatus.None,
      initialCommentData?.myStatus,
      {
        likesCount: foundComment.likesInfo.likesCount,
        dislikesCount: foundComment.likesInfo.dislikesCount
      },
    )

    const user = await this.usersQueryRepository.fetchAllUserDataById(userId)
    if (!user) return false

    if (initialCommentData?.myStatus) {
      user.updateExistingUserCommentLike(newStatus, commentObjectId)
    } else {
      user.setNewUserCommentLike(newStatus, commentObjectId)
    }

    await this.usersRepository.save(user)

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
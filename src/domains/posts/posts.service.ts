import {PostsRepository} from "../../infrastructure/repositories/postsRepository";
import {ObjectId} from "mongodb";
import {PostsQueryRepository} from "../../infrastructure/repositories/postsQueryRepository";
import {inject, injectable} from "inversify";
import {PostType} from "../../dto/postDto";
import {PostLikeModel, PostModel} from "../../db/db";
import {BlogsQueryRepository} from "../../infrastructure/repositories/blogsQueryRepository";
import {likeStatus} from "../../types/generalTypes";
import {PostViewModel} from "../../features/posts/models/PostViewModel";
import {LikesQueryRepository} from "../../infrastructure/repositories/likesQueryRepository";
import {LikesRepository} from "../../infrastructure/repositories/likesRepository";
import {jwtService} from "../../application/jwt-service";
import {GetSortedPostsModel} from "../../features/posts/models/GetSortedPostsModel";
import {likesCounter} from "../../utils/likesCounter";
import {PostLikeUserInfoType} from "../../types/postsLikesTypes";

@injectable()
export class PostsService {
  constructor(@inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository,
              @inject(PostsRepository) protected postsRepository: PostsRepository,
              @inject(BlogsQueryRepository) protected blogsQueryRepository: BlogsQueryRepository,
              @inject(LikesQueryRepository) protected likesQueryRepository: LikesQueryRepository,
              @inject(LikesRepository) protected likesRepository: LikesRepository
  ) {}

  async createPost(
    title: string,
    content: string,
    shortDescription: string,
    blogId: ObjectId
  ): Promise<PostViewModel> {
    const blog = await this.blogsQueryRepository.findBlogById(blogId)

    const initialPostModel = PostModel.makeInstance(
      title,
      shortDescription,
      content,
      blogId,
      blog?.name ?? ''
    )

    await this.postsRepository.save(initialPostModel)

    return {
      id: initialPostModel.id,
      title: initialPostModel.title,
      content: initialPostModel.content,
      shortDescription: initialPostModel.shortDescription,
      blogId: initialPostModel.blogId,
      createdAt: initialPostModel.createdAt,
      blogName: initialPostModel.blogName,
      extendedLikesInfo: {
        likesCount: initialPostModel.extendedLikesInfo.likesCount,
        dislikesCount: initialPostModel.extendedLikesInfo.dislikesCount,
        myStatus: likeStatus.None,
        newestLikes: initialPostModel.extendedLikesInfo.newestLikes
      }
    }
  }

  async updatePostById(
    id: string,
    title: string,
    content: string,
    shortDescription: string,
    blogId: string
  ): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false
    if (!ObjectId.isValid(blogId)) return false

    const post = await this.postsQueryRepository.findPostById(new ObjectId(id))
    if (!post) return false

    post.updatePost(title, content, shortDescription,)

    await this.postsRepository.save(post)
    return true
  }

  async changeLikesCount(
    id: string,
    myStatus: string,
    userId: ObjectId,
    login: string
  ): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false
    const postObjectId = new ObjectId(id)
    const foundPost = await this.postsQueryRepository.findPostById(postObjectId)
    if (!foundPost) return false


    const userPostLike = await this.likesQueryRepository.findPostLikeByUserIdAndPostId(userId, postObjectId)
    const initialStatus = userPostLike?.myStatus

    if (initialStatus === myStatus) return true

    const {likesInfo, newStatus} = likesCounter(
      myStatus,
      likeStatus.None,
      initialStatus,
      {
        likesCount: foundPost.extendedLikesInfo.likesCount,
        dislikesCount: foundPost.extendedLikesInfo.dislikesCount
      },
    )

    if (userPostLike) {
      userPostLike.updateExistingPostLike(newStatus)
      await this.likesRepository.save(userPostLike)
    } else {
      const postLike = PostLikeModel.makeInstance(userId, postObjectId, newStatus)
      await this.likesRepository.save(postLike)
    }

    if (newStatus === likeStatus.Like) {
      const userPostLikeViewInfo: PostLikeUserInfoType = {
        addedAt: new Date().toISOString(),
        userId,
        login
      }

      await this.postsRepository.addNewUserLikeInfo(postObjectId, userPostLikeViewInfo)
    }

    if (newStatus === likeStatus.None || newStatus === likeStatus.Dislike) {
      await this.postsRepository.deleteUserLikeInfo(postObjectId, userId)
    }

    foundPost.changeLikesCount(likesInfo.likesCount, likesInfo.dislikesCount)
    await this.postsRepository.save(foundPost)
    return true
  }

  async findPostById(id: string): Promise<PostType | null> {
    if (!ObjectId.isValid(id)) return null
    return await this.postsQueryRepository.findPostByIdWithoutMongoId(new ObjectId(id))
  }

  async getSortedPosts(params: GetSortedPostsModel, accessTokenHeader: string | undefined): Promise<any> {
    let userId
    if (accessTokenHeader) {
      const accessToken = accessTokenHeader.split(' ')[1]
      userId = await jwtService.getUserIdByAccessToken(accessToken)
    }

    return await this.postsQueryRepository.getSortedPosts(params, userId)
  }

  async getPostById(id: string, accessTokenHeader: string | undefined): Promise<PostViewModel | null> {
    if (!ObjectId.isValid(id)) return null
    const objectPostId = new ObjectId(id)

    let userId
    if (accessTokenHeader) {
      const accessToken = accessTokenHeader.split(' ')[1]
      userId = await jwtService.getUserIdByAccessToken(accessToken)
    }

    let userLikeStatus = likeStatus.None

    if (userId) {
      const userCommentsLikes = await this.likesQueryRepository.findPostLikeByUserIdAndPostId(userId, objectPostId)

      if (userCommentsLikes) userLikeStatus = userCommentsLikes.myStatus
    }

    return await this.postsQueryRepository.getPost(objectPostId, userLikeStatus)
  }

  async deletePost(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false
    return await this.postsRepository.deletePost(new ObjectId(id))
  }
}
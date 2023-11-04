import {PostModel} from "../../db/db"
import {
  CommentStatus,
  PostsLikesInfo,
  PostsType,
} from "../../types/generalTypes";
import {createDefaultSortedParams, getPagesCount} from "../../utils/utils";
import {GetSortedPostsModel} from "../../features/posts/models/GetSortedPostsModel";
import {mockPostModel} from "../../constants/blanks";
import {ObjectId} from "mongodb";
import 'reflect-metadata'
import {injectable} from "inversify";
import {HydratedPostType} from "../../types/postsTypes";
import {PostType} from "../../dto/postDto";
import {PostViewModel} from "../../features/posts/models/PostViewModel";
import {LikesQueryRepository} from "./likesQueryRepository";

@injectable()
export class PostsQueryRepository {
  likesQueryRepository: LikesQueryRepository

  constructor() {
    this.likesQueryRepository = new LikesQueryRepository()
  }

  async getSortedPosts(params: GetSortedPostsModel, userId: ObjectId | undefined): Promise<PostsType> {
    const {
      pageNumber,
      pageSize,
      skipSize,
      sortBy,
      sortDirection
    } = createDefaultSortedParams({
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      model: mockPostModel
    })

    const posts: Array<PostType> = await PostModel
      .find({}, {_id: 0, __v: 0})
      .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .lean()

    const postsCount = await PostModel.countDocuments()

    const pagesCount = getPagesCount(postsCount, pageSize)

    let usersPostsLikes: any
    if (userId) {
      usersPostsLikes = await this.likesQueryRepository.fetchAllUserLikeByUserId(userId)
    }

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: posts.map(post => {
        return {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount: post.extendedLikesInfo.likesCount,
            dislikesCount: post.extendedLikesInfo.dislikesCount,
            myStatus: usersPostsLikes?.find((up: PostsLikesInfo) => up.postId === post.id)?.myStatus ?? CommentStatus.None,
            newestLikes: post.extendedLikesInfo.newestLikes
              .sort((a: any, b: any) => new Date(b.addedAt).valueOf() - new Date(a.addedAt).valueOf())
              .slice(0, 3)
          }
        }
      })
    }
  }

  async findPostByIdWithoutMongoId(id: ObjectId): Promise<PostType | null> {
    return await PostModel.findOne({id}, {_id: 0, __v: 0}).exec()
  }

  async getPost(id: ObjectId, userLikeStatus: CommentStatus): Promise<PostViewModel | null> {
    const post =  await PostModel.findOne({id}, {_id: 0, __v: 0}).exec()
    return post ? {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: userLikeStatus,
        newestLikes: post.extendedLikesInfo.newestLikes
          .sort((a: any, b: any) => new Date(b.addedAt).valueOf() - new Date(a.addedAt).valueOf())
          .slice(0, 3)
      }
    } : null
  }

  async findPostById(id: ObjectId): Promise<HydratedPostType | null> {
    return PostModel.findOne({id})
  }

  async findPostsByIdForSpecificBlog(params: GetSortedPostsModel, id: string, userId: ObjectId | undefined): Promise<PostsType | null> {
    const {
      pageNumber,
      pageSize,
      skipSize,
      sortBy,
      sortDirection
    } = createDefaultSortedParams({
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      model: mockPostModel
    })

    const posts = await PostModel
      .find({blogId: id}, {_id: 0, __v: 0})
      .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .lean()

    const postsCount = await PostModel.countDocuments({blogId: id})

    const pagesCount = getPagesCount(postsCount , pageSize)

    let usersPostsLikes: any
    if (userId) {
      usersPostsLikes = await this.likesQueryRepository.fetchAllUserLikeByUserId(userId)
    }

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: posts.map(post => {
        return {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount: post.extendedLikesInfo.likesCount,
            dislikesCount: post.extendedLikesInfo.dislikesCount,
            myStatus: usersPostsLikes?.find((up: PostsLikesInfo) => up.postId === post.id)?.myStatus ?? CommentStatus.None,
            newestLikes: post.extendedLikesInfo.newestLikes
              .sort((a: any, b: any) => new Date(b.addedAt).valueOf() - new Date(a.addedAt).valueOf())
              .slice(0, 3)
          }
        }
      })
    }
  }
}
import {PostsQueryRepository} from "../../infrastructure/repositories/postsQueryRepository";
import {CommentsService} from "../../domains/comments/comments.service";
import {PostsService} from "../../domains/posts/posts.service";
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery
} from "../../types/types";
import {GetSortedPostsModel} from "./models/GetSortedPostsModel";
import {Response} from "express";
import {GetPostModel} from "./models/GetPostModel";
import {ObjectId} from "mongodb";
import {CreatePostModel} from "./models/CreatePostModel";
import {URIParamsCommentModel} from "../comments/models/URIParamsCommentModel";
import {CreateCommentModel} from "../comments/models/CreateCommentModel";
import {GetSortedCommentsModel} from "../comments/models/GetSortedCommentsModel";
import {URIParamsPostIdModel} from "./models/URIParamsPostIdModel";
import {UpdatePostModel} from "./models/UpdatePostModel";
import {DeletePostModel} from "./models/DeletePostModel";
import {inject, injectable} from "inversify";
import {UpdatePostLikeModel} from "./models/UpdatePostLikeModel";
import {HTTP_STATUSES} from "../../utils/utils";

@injectable()
export class PostController {
  constructor(@inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository,
              @inject(CommentsService)  protected commentsService: CommentsService,
              @inject(PostsService)  protected postsService: PostsService
  ) {
  }

  async getPosts(req: RequestWithQuery<GetSortedPostsModel>, res: Response) {
    res.json(await this.postsService.getSortedPosts(req.query, req.headers?.authorization))
  }

  async getPost(req: RequestWithParams<GetPostModel>, res: Response) {
    const foundPost = await this.postsService.getPostById(req.params.id, req.headers?.authorization)

    !foundPost
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.send(foundPost)
  }

  async createPost(req: RequestWithBody<CreatePostModel>, res: Response) {
    const {title, content, shortDescription, blogId} = req.body
    const newPost = await this.postsService.createPost(title, content, shortDescription, blogId)

    res.status(HTTP_STATUSES.CREATED_201).send(newPost)
  }

  async createComment(req: RequestWithParamsAndBody<URIParamsCommentModel, CreateCommentModel>, res: Response) {
    const foundPost = await this.postsService.findPostById(req.params.id)

    if (!foundPost) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    const newComment = await this.commentsService.createComment(
      req.body.content,
      new ObjectId(req.params.id),
      new ObjectId(req.user!.id),
      req.user!.login
    )

    res.status(HTTP_STATUSES.CREATED_201).send(newComment)
  }

  async getComments(req: RequestWithParamsAndQuery<URIParamsCommentModel, GetSortedCommentsModel>, res: Response) {
    const foundComments = await this.commentsService.getSortedComments(req.params.id, req.query, req.headers?.authorization)

    if (!foundComments) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }
    res.json(foundComments)
  }

  async updatePost(req: RequestWithParamsAndBody<URIParamsPostIdModel, UpdatePostModel>, res: Response) {
    const {title, content, shortDescription, blogId} = req.body
    const updatedPost = await this.postsService.updatePostById(
      req.params.id,
      title,
      content,
      shortDescription,
      blogId
    )

    !updatedPost
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  }

  async changeLikeStatus(req: RequestWithParamsAndBody<URIParamsPostIdModel, UpdatePostLikeModel>, res: Response) {
    const isLikesCountChanges = await this.postsService.changeLikesCount(
      req.params.id,
      req.body.likeStatus,
      new ObjectId(req.user!.id),
      req.user!.login
    )

    res.sendStatus(
      isLikesCountChanges
        ? HTTP_STATUSES.NO_CONTENT_204
        : HTTP_STATUSES.NOT_FOUND_404
    )
  }

  async deletePost(req: RequestWithParams<DeletePostModel>, res: Response) {
    const isPostExist = await this.postsService.deletePost(req.params.id)

    !isPostExist
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  }
}
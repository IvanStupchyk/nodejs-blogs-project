import express, {Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery
} from "../../types/types";
import {CreatePostModel} from "./models/CreatePostModel";
import {GetPostModel} from "./models/GetPostModel";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {postValidationMiddleware} from "../../middlewares/postValidationMiddleware";
import {URIParamsPostIdModel} from "./models/URIParamsPostIdModel";
import {UpdatePostModel} from "./models/UpdatePostModel";
import {DeletePostModel} from "./models/DeletePostModel";
import {postsService} from "../../domains/posts.service";
import {GetSortedPostsModel} from "./models/GetSortedPostsModel";
import {postsQueryRepository} from "../../repositories/postsQueryRepository";
import {CreateCommentModel} from "../comments/models/CreateCommentModel";
import {URIParamsCommentModel} from "../comments/models/URIParamsCommentModel";
import {commentsService} from "../../domains/comments.service";
import {commentValidationMiddleware} from "../../middlewares/commentValidationMiddleware";
import {GetSortedCommentsModel} from "../comments/models/GetSortedCommentsModel";
import {authBasicValidationMiddleware} from "../../middlewares/authBasicValidationMiddleware";

export const getPostRouter = () => {
  const router = express.Router()

  router.get('/', async (req: RequestWithQuery<GetSortedPostsModel>, res: Response) => {
    res.json(await postsQueryRepository.getSortedPosts(req.query))
  })

  router.get('/:id', async (req: RequestWithParams<GetPostModel>, res: Response) => {
    const foundPost = await postsQueryRepository.findPostById(req.params.id)

    !foundPost
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.send(foundPost)
  })

  router.post(
    '/',
    ...postValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<CreatePostModel>, res: Response) => {
    const {title, content, shortDescription, blogId} = req.body
    const newPost = await postsService.createPost(title, content, shortDescription, blogId)

    res.status(HTTP_STATUSES.CREATED_201).send(newPost)
  })

  router.post(
    '/:id/comments',
    ...commentValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithParamsAndBody<URIParamsCommentModel, CreateCommentModel>, res: Response) => {
      const foundPost = await postsQueryRepository.findPostById(req.params.id)

      if (!foundPost) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
      }

      const newComment = await commentsService.createComment(
        req.body.content,
        req.params.id,
        req.user!.id,
        req.user!.login
      )

      res.status(HTTP_STATUSES.CREATED_201).send(newComment)
  })

  router.get('/:id/comments', async (req: RequestWithParamsAndQuery<URIParamsCommentModel, GetSortedCommentsModel>, res: Response) => {
    const foundComments = await commentsService.getSortedComments(req.params.id, req.query, req.cookies?.refreshToken)

    if (!foundComments) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }
    res.json(foundComments)
  })

  router.put(
    '/:id',
    ...postValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithParamsAndBody<URIParamsPostIdModel, UpdatePostModel>, res: Response) => {
      const {title, content, shortDescription, blogId} = req.body
      const updatedPost = await postsService.updatePostById(
        req.params.id,
        title,
        content,
        shortDescription,
        blogId
      )

      !updatedPost
        ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  router.delete('/:id', authBasicValidationMiddleware, async (req: RequestWithParams<DeletePostModel>, res: Response) => {
    const isPostExist = await postsService.deletePost(req.params.id)

    !isPostExist
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  return router
}
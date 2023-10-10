import express, {Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery} from "../../types/types";
import {CreatePostModel} from "./models/CreatePostModel";
import {GetPostModel} from "./models/GetPostModel";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {postValidationMiddleware} from "../../middlewares/postValidationMiddleware";
import {URIParamsPostIdModel} from "./models/URIParamsPostIdModel";
import {UpdatePostModel} from "./models/UpdatePostModel";
import {authValidationMiddleware} from "../../middlewares/authValidationMiddleware";
import {DeletePostModel} from "./models/DeletePostModel";
import {postsService} from "../../domains/posts.service";
import {GetSortedPostsModel} from "./models/GetSortedPostsModel";
import {postsQueryRepository} from "../../repositories/postsQueryRepository";

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

  router.delete('/:id', authValidationMiddleware, async (req: RequestWithParams<DeletePostModel>, res: Response) => {
    const isPostExist = await postsService.deletePost(req.params.id)

    !isPostExist
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  return router
}
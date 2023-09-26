import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../types/types";
import {CreatePostModel} from "./models/CreatePostModel";
import {GetPostModel} from "./models/GetPostModel";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {postsRepository} from "../../repositories/postsRepository";
import {postValidationMiddleware} from "../../middlewares/postValidationMiddleware";
import {URIParamsPostIdModel} from "./models/URIParamsPostIdModel";
import {UpdatePostModel} from "./models/UpdatePostModel";
import {authValidationMiddleware} from "../../middlewares/authValidationMiddleware";
import {DeletePostModel} from "./models/DeletePostModel";

export const getPostRouter = () => {
  const router = express.Router()

  router.get('/', async (req: Request, res: Response) => {
    res.json(await postsRepository.getAllPosts())
  })

  router.get('/:id', async (req: RequestWithParams<GetPostModel>, res: Response) => {
    const foundPost = await postsRepository.findPostById(req.params.id)

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
    const newPost = await postsRepository.createPost(title, content, shortDescription, blogId)

    res.status(HTTP_STATUSES.CREATED_201).send(newPost)
  })

  router.put(
    '/:id',
    ...postValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithParamsAndBody<URIParamsPostIdModel, UpdatePostModel>, res: Response) => {
      const {title, content, shortDescription, blogId} = req.body
      const updatedPost = await postsRepository.updatePostById(
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
    const isPostExist = await postsRepository.deletePost(req.params.id)

    !isPostExist
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  return router
}
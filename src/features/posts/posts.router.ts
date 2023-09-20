import {DBType} from "../../db/db";
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

export const getPostRouter = (db: DBType) => {
  const router = express.Router()

  router.get('/', (req: Request, res: Response) => {
    res.json(db.posts)
  })

  router.get('/:id', (req: RequestWithParams<GetPostModel>, res: Response) => {
    const foundPost = postsRepository.findPostById(req.params.id)

    !foundPost
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.send(foundPost)
  })

  router.post(
    '/',
    ...postValidationMiddleware,
    inputValidationErrorsMiddleware,
    (req: RequestWithBody<CreatePostModel>, res: Response) => {
    const {title, content, shortDescription, blogId} = req.body
    const newPost = postsRepository.createPost(title, content, shortDescription, blogId)

    res.status(HTTP_STATUSES.CREATED_201).send(newPost)
  })

  router.put(
    '/:id',
    ...postValidationMiddleware,
    inputValidationErrorsMiddleware,
    (req: RequestWithParamsAndBody<URIParamsPostIdModel, UpdatePostModel>, res: Response) => {
      const {title, content, shortDescription, blogId} = req.body
      const updatedPost = postsRepository.updatePostById(
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

  router.delete('/:id', authValidationMiddleware, (req: RequestWithParams<DeletePostModel>, res: Response) => {
    const isPostExist = postsRepository.deletePost(req.params.id)

    !isPostExist
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  return router
}
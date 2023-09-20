import {DBType} from "../../db/db";
import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../types/types";
import {CreateBlogModel} from "./models/CreateBlogModel";
import {GetBlogModel} from "./models/GetBlogModel";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {authValidationMiddleware} from "../../middlewares/authValidationMiddleware";
import {blogsRepository} from "../../repositories/blogsRepository";
import {UpdateBlogModel} from "./models/UpdateBlogModel";
import {URIParamsBlogIdModel} from "./models/URIParamsBlogIdModel";
import {DeleteBlogModel} from "./models/DeleteBlogModel";
import {blogValidationMiddleware} from "../../middlewares/blogValidationMiddleware";

export const getBlogRouter = (db: DBType) => {
  const router = express.Router()

  router.get('/', (req: Request, res: Response) => {
    res.json(db.blogs)
  })

  router.get('/:id', (req: RequestWithParams<GetBlogModel>, res: Response) => {
    const foundBlog = blogsRepository.findBlogById(req.params.id)

    !foundBlog
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.send(foundBlog)
  })

  router.post(
    '/',
    ...blogValidationMiddleware,
    inputValidationErrorsMiddleware,
    (req: RequestWithBody<CreateBlogModel>, res: Response) => {
    const {name, websiteUrl, description} = req.body
    const newBlog = blogsRepository.createBlog(name, description, websiteUrl)

    res.status(HTTP_STATUSES.CREATED_201).send(newBlog)
  })

  router.put(
    '/:id',
    ...blogValidationMiddleware,
    inputValidationErrorsMiddleware,
    (req: RequestWithParamsAndBody<URIParamsBlogIdModel, UpdateBlogModel>, res: Response) => {
      const {name, websiteUrl, description} = req.body

      const updatedBlog = blogsRepository.updateBlogById(
        req.params.id,
        name,
        description,
        websiteUrl
      )

      !updatedBlog
        ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  router.delete('/:id', authValidationMiddleware, (req: RequestWithParams<DeleteBlogModel>, res: Response) => {
    const isBlogExist = blogsRepository.deleteBlog(req.params.id)

    !isBlogExist
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  return router
}
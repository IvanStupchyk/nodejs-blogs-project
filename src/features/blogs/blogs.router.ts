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

export const getBlogRouter = () => {
  const router = express.Router()

  router.get('/', async (req: Request, res: Response) => {
    res.json(await blogsRepository.getAllPBlogs())
  })

  router.get('/:id', async (req: RequestWithParams<GetBlogModel>, res: Response) => {
    const foundBlog = await blogsRepository.findBlogById(req.params.id)

    !foundBlog
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.send(foundBlog)
  })

  router.post(
    '/',
    ...blogValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<CreateBlogModel>, res: Response) => {
    const {name, websiteUrl, description} = req.body
    const newBlog = await blogsRepository.createBlog(name, description, websiteUrl)

    res.status(HTTP_STATUSES.CREATED_201).send(newBlog)
  })

  router.put(
    '/:id',
    ...blogValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithParamsAndBody<URIParamsBlogIdModel, UpdateBlogModel>, res: Response) => {
      const {name, websiteUrl, description} = req.body

      const updatedBlog = await blogsRepository.updateBlogById(
        req.params.id,
        name,
        description,
        websiteUrl
      )

      !updatedBlog
        ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  router.delete('/:id', authValidationMiddleware, async (req: RequestWithParams<DeleteBlogModel>, res: Response) => {
    const isBlogExist = await blogsRepository.deleteBlog(req.params.id)

    !isBlogExist
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  return router
}
import express, {Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery
} from "../../types/types";
import {CreateBlogModel} from "./models/CreateBlogModel";
import {GetBlogModel} from "./models/GetBlogModel";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {authValidationMiddleware} from "../../middlewares/authValidationMiddleware";
import {UpdateBlogModel} from "./models/UpdateBlogModel";
import {URIParamsBlogIdModel} from "./models/URIParamsBlogIdModel";
import {DeleteBlogModel} from "./models/DeleteBlogModel";
import {blogValidationMiddleware} from "../../middlewares/blogValidationMiddleware";
import {blogsService} from "../../domains/blogs.service";
import {postsService} from "../../domains/posts.service";
import {CreatePostForSpecificBlogModel} from "../posts/models/CreatePostForSpecificBlogModel";
import {postForSpecificBlogValidationMiddleware} from "../../middlewares/postForSpecifigBlogValidationMiddleware";
import {GetSortedBlogsModel} from "./models/GetSortedBlogsModel";
import {GetSortedPostsModel} from "../posts/models/GetSortedPostsModel";
import {blogsQueryRepository} from "../../repositories/blogsQueryRepository";
import {postsQueryRepository} from "../../repositories/postsQueryRepository";

export const getBlogRouter = () => {
  const router = express.Router()

  router.get(
    '/',
    async (req: RequestWithQuery<GetSortedBlogsModel>, res: Response) => {
    res.json(await blogsQueryRepository.getSortedBlogs(req.query))
  })

  router.get(
    '/:id',
    async (req: RequestWithParams<GetBlogModel>, res: Response) => {
    const foundBlog = await blogsQueryRepository.findBlogById(req.params.id)

    !foundBlog
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.send(foundBlog)
  })

  router.get('/:id/posts', async (
    req: RequestWithParamsAndQuery<GetBlogModel, GetSortedPostsModel>,
    res: Response
  ) => {
    const foundBlog = await blogsQueryRepository.findBlogById(req.params.id)

    if (!foundBlog) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    const foundPosts = await postsQueryRepository.findPostsByIdForSpecificBlog(req.query, req.params.id)
    res.send(foundPosts)
  })

  router.post(
    '/',
    ...blogValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithBody<CreateBlogModel>, res: Response) => {
    const {name, websiteUrl, description} = req.body
    const newBlog = await blogsService.createBlog(name, description, websiteUrl)

    res.status(HTTP_STATUSES.CREATED_201).send(newBlog)
  })

  router.post(
    '/:id/posts',
    ...postForSpecificBlogValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (
      req: RequestWithParamsAndBody<URIParamsBlogIdModel, CreatePostForSpecificBlogModel>,
      res: Response
    ) => {
      const {title, content, shortDescription} = req.body
      const blogId = req.params.id

      const foundBlog = await blogsQueryRepository.findBlogById(req.params.id)

      if (!foundBlog) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
      }

      const newPost = await postsService.createPost(title, content, shortDescription, blogId)
      res.status(HTTP_STATUSES.CREATED_201).send(newPost)
    })

  router.put(
    '/:id',
    ...blogValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithParamsAndBody<URIParamsBlogIdModel, UpdateBlogModel>, res: Response) => {
      const {name, websiteUrl, description} = req.body

      const updatedBlog = await blogsService.updateBlogById(
        req.params.id,
        name,
        description,
        websiteUrl
      )

      !updatedBlog
        ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        : res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  router.delete(
    '/:id',
    authValidationMiddleware,
    async (req: RequestWithParams<DeleteBlogModel>, res: Response) => {
      const isBlogExist = await blogsService.deleteBlog(req.params.id)

      res.sendStatus(!isBlogExist
        ? HTTP_STATUSES.NOT_FOUND_404
        : HTTP_STATUSES.NO_CONTENT_204
      )
  })

  return router
}
import express from "express";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {blogValidationMiddleware} from "../../middlewares/blogValidationMiddleware";
import {postForSpecificBlogValidationMiddleware} from "../../middlewares/postForSpecifigBlogValidationMiddleware";
import {authBasicValidationMiddleware} from "../../middlewares/authBasicValidationMiddleware";
import {blogsContainer} from "../../compositionRoots/compositionRootBlogs";
import {BlogController} from "./blogController";

const blogController = blogsContainer.resolve(BlogController)

export const blogRouter = () => {
  const router = express.Router()

  router.get('/', blogController.getBlogs.bind(blogController))

  router.get('/:id',blogController.getCurrentBlog.bind(blogController))

  router.get('/:id/posts', blogController.getPostsForBlog.bind(blogController))

  router.post(
    '/',
    ...blogValidationMiddleware,
    inputValidationErrorsMiddleware,
    blogController.createBlog.bind(blogController)
  )

  router.post(
    '/:id/posts',
    ...postForSpecificBlogValidationMiddleware,
    inputValidationErrorsMiddleware,
    blogController.createPostForSpecificBlog.bind(blogController)
  )

  router.put(
    '/:id',
    ...blogValidationMiddleware,
    inputValidationErrorsMiddleware,
    blogController.updateBlog.bind(blogController)
  )

  router.delete(
    '/:id',
    authBasicValidationMiddleware,
    blogController.deleteBlog.bind(blogController)
  )

  return router
}
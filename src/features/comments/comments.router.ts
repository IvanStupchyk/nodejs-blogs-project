import express from "express";
import {commentValidationMiddleware} from "../../middlewares/commentValidationMiddleware";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {authValidationMiddleware} from "../../middlewares/authValidationMiddleware";
import {likeValidationMiddleware} from "../../middlewares/likeValidationMiddleware";
import {commentsContainer} from "../../compositionRoots/compositionRootComments";
import {CommentsController} from "./commentsController";

const commentsController = commentsContainer.resolve(CommentsController)

export const commentsRouter = () => {
  const router = express.Router()

  router.get('/:id', commentsController.getComment.bind(commentsController))

  router.put(
    '/:id',
    ...commentValidationMiddleware,
    inputValidationErrorsMiddleware,
    commentsController.changeComment.bind(commentsController)
  )

  router.put(
    '/:id/like-status',
    ...likeValidationMiddleware,
    inputValidationErrorsMiddleware,
    commentsController.likeComment.bind(commentsController)
  )

  router.delete(
    '/:id',
    authValidationMiddleware,
    commentsController.deleteComment.bind(commentsController)
  )

  return router
}
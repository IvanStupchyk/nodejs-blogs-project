import express, {Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {RequestWithParams, RequestWithParamsAndBody} from "../../types/types";
import {commentsQueryRepository} from "../../repositories/comentsQueryRepository";
import {GetCommentModel} from "./models/GetCommentModel";
import {commentValidationMiddleware} from "../../middlewares/commentValidationMiddleware";
import {inputValidationErrorsMiddleware} from "../../middlewares/inputValidationErrorsMiddleware";
import {URIParamsCommentModel} from "./models/URIParamsCommentModel";
import {UpdateCommentModel} from "./models/UpdateCommentModel";
import {commentsService} from "../../domains/comments.service";
import {authValidationMiddleware} from "../../middlewares/authValidationMiddleware";
import {DeleteCommentModel} from "./models/DeleteCommentModel";
import {UpdateLikesModel} from "./models/UpdateLikesModel";
import {commentLikesValidationMiddleware} from "../../middlewares/commentLikesValidationMiddleware";

export const commentsRouter = () => {
  const router = express.Router()

  router.get(
    '/:id',
    async (req: RequestWithParams<GetCommentModel>, res: Response) => {
    const foundComment = await commentsService.findCommentById(req.params.id, req.headers?.authorization)

    !foundComment
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.send(foundComment)
  })

  router.put(
    '/:id',
    ...commentValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithParamsAndBody<URIParamsCommentModel, UpdateCommentModel>, res: Response) => {
      const foundComment = await commentsQueryRepository.findCommentById(req.params.id)

      if (foundComment && foundComment.commentatorInfo.userId !== req.user?.id) {
        res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
        return
      }

      const isCommentUpdated = await commentsService.updateComment(req.body.content, req.params.id)

      res.sendStatus(
        isCommentUpdated
          ? HTTP_STATUSES.NO_CONTENT_204
          : HTTP_STATUSES.NOT_FOUND_404
      )
  })

  router.put(
    '/:id/like-status',
    ...commentLikesValidationMiddleware,
    inputValidationErrorsMiddleware,
    async (req: RequestWithParamsAndBody<URIParamsCommentModel, UpdateLikesModel>, res: Response) => {
      const isLikesCountChanges = await commentsService.changeLikesCount(req.params.id, req.body.likeStatus, req.user!.id)

      res.sendStatus(
        isLikesCountChanges
          ? HTTP_STATUSES.NO_CONTENT_204
          : HTTP_STATUSES.NOT_FOUND_404
      )
    })

  router.delete(
    '/:id',
    authValidationMiddleware,
    async (req: RequestWithParams<DeleteCommentModel>, res: Response) => {
      const foundComment = await commentsQueryRepository.findCommentById(req.params.id)

      if (foundComment && foundComment.commentatorInfo.userId !== req.user?.id) {
        res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
        return
      }

      const isCommentDeleted = await commentsService.deleteComment(req.params.id)

      res.sendStatus(!isCommentDeleted
        ? HTTP_STATUSES.NOT_FOUND_404
        : HTTP_STATUSES.NO_CONTENT_204
      )
  })

  return router
}
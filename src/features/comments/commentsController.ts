import {CommentsService} from "../../domains/comments/comments.service";
import {RequestWithParams, RequestWithParamsAndBody} from "../../types/types";
import {GetCommentModel} from "./models/GetCommentModel";
import {Response} from "express";
import {URIParamsCommentModel} from "./models/URIParamsCommentModel";
import {UpdateCommentModel} from "./models/UpdateCommentModel";
import {UpdateLikesModel} from "./models/UpdateLikesModel";
import {ObjectId} from "mongodb";
import {DeleteCommentModel} from "./models/DeleteCommentModel";
import {inject, injectable} from "inversify";
import {HTTP_STATUSES} from "../../utils/utils";

@injectable()
export class CommentsController {
  constructor(@inject(CommentsService) protected commentsService: CommentsService) {
  }

  async getComment(req: RequestWithParams<GetCommentModel>, res: Response) {
    const foundComment = await this.commentsService.findCommentById(req.params.id, req.headers?.authorization)

    !foundComment
      ? res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      : res.send(foundComment)
  }

  async changeComment(req: RequestWithParamsAndBody<URIParamsCommentModel, UpdateCommentModel>, res: Response) {
    const foundComment = await this.commentsService.findCommentByIdWithoutLikeStatus(req.params.id)

    if (foundComment && foundComment.commentatorInfo.userId !== req.user?.id) {
      res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
      return
    }

    const isCommentUpdated = await this.commentsService.updateComment(req.body.content, req.params.id)

    res.sendStatus(
      isCommentUpdated
        ? HTTP_STATUSES.NO_CONTENT_204
        : HTTP_STATUSES.NOT_FOUND_404
    )
  }

  async likeComment(req: RequestWithParamsAndBody<URIParamsCommentModel, UpdateLikesModel>, res: Response) {
    const isLikesCountChanges = await this.commentsService
      .changeLikesCount(req.params.id, req.body.likeStatus, new ObjectId(req.user!.id))

    res.sendStatus(
      isLikesCountChanges
        ? HTTP_STATUSES.NO_CONTENT_204
        : HTTP_STATUSES.NOT_FOUND_404
    )
  }

  async deleteComment(req: RequestWithParams<DeleteCommentModel>, res: Response) {
    const foundComment = await this.commentsService.findCommentByIdWithoutLikeStatus(req.params.id)

    if (foundComment && foundComment.commentatorInfo.userId !== req.user?.id) {
      res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
      return
    }

    const isCommentDeleted = await this.commentsService.deleteComment(req.params.id)

    res.sendStatus(!isCommentDeleted
      ? HTTP_STATUSES.NOT_FOUND_404
      : HTTP_STATUSES.NO_CONTENT_204
    )
  }
}
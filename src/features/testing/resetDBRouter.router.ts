import {
  ApiRequestModel,
  BlogModel,
  CommentModel,
  PostModel,
  UserModel,
} from "../../db/db";
import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";

export const resetDBRouterRouter = () => {
  const router = express.Router()

  router.delete('/all-data', async (req: Request, res: Response) => {
    await BlogModel.deleteMany()
    await PostModel.deleteMany()
    await UserModel.deleteMany()
    await CommentModel.deleteMany()
    await ApiRequestModel.deleteMany()

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  return router
}
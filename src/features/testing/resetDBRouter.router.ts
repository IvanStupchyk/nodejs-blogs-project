import {DBType} from "../../db/db";
import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";

export const resetDBRouterRouter = (db: DBType) => {
  const router = express.Router()

  router.delete('/all-data', (req: Request, res: Response) => {
    db.posts = []
    db.blogs = []

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  return router
}
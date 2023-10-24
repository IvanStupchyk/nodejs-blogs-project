import {
  apiRequestsCountCollections,
  blogsCollections,
  commentsCollections,
  postsCollections,
  usersCollections
} from "../../db/db";
import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";

export const resetDBRouterRouter = () => {
  const router = express.Router()

  router.delete('/all-data', async (req: Request, res: Response) => {
    await blogsCollections.deleteMany({})
    await postsCollections.deleteMany({})
    await usersCollections.deleteMany({})
    await commentsCollections.deleteMany({})
    await apiRequestsCountCollections.deleteMany({})

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  return router
}
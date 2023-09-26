import {client} from "../../db/db";
import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";

export const resetDBRouterRouter = () => {
  const router = express.Router()

  router.delete('/all-data', async (req: Request, res: Response) => {
    await client.db().dropDatabase()

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  return router
}
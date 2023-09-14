import {DBType, VideoType} from "../../db/db";
import express, {Request, Response} from "express";
import {HTTP_STATUSES} from "../../utils";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../types/types";
import {CreateVideoModel} from "./models/CreateVideoModel";
import {GetVideoModel} from "./models/GetVideoModel";
import {DeleteVideoModel} from "./models/DeleteVideoModel";
import {URIParamsVideoIdModel} from "./models/URIParamsVideoIdModel";
import {UpdateVideoModel} from "./models/UpdateVideoModel";
import {videoParamsValidation} from "../../validation/validation";

export const getVideosRouter = (db: DBType) => {
  const router = express.Router()

  router.get('', (req: Request, res: Response) => {

    res.json(db)
  })

  router.get('/:id', (req: RequestWithParams<GetVideoModel>, res: Response) => {
    const foundVideo = db.find(v => v.id === +req.params.id)

    if (!foundVideo) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    res.send(foundVideo)
  })

  router.post('', (req: RequestWithBody<CreateVideoModel>, res: Response) => {
    let { title, author, availableResolutions } = req.body

    const errorMessages = videoParamsValidation(title, author, availableResolutions)

    if (errorMessages.errorsMessages.length) {
      res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errorMessages)
      return
    }

    const createdAt: Date = new Date()

    // let publicationDate: Date = new Date(createdAt)
    // publicationDate.setDate(createdAt.getDate() + 1)
    let publicationDate = new Date(createdAt.getTime() + 86400000)

    const createdVideo: VideoType = {
      id: 32,
      author,
      title,
      availableResolutions,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: createdAt.toISOString(),
      publicationDate: publicationDate.toISOString(),
    }

    db.push(createdVideo)

    res.status(HTTP_STATUSES.CREATED_201).send(createdVideo)
  })

  router.delete('/:id', (req: RequestWithParams<DeleteVideoModel>, res: Response) => {
    const id = +req.params.id
    const foundVideo = db.find(v => v.id === id)

    if (!foundVideo) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    db = db.filter(v => v.id !== id)

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  router.put('/:id', (req: RequestWithParamsAndBody<URIParamsVideoIdModel, UpdateVideoModel>, res: Response) => {
    let {
      title,
      author,
      availableResolutions,
      canBeDownloaded,
      minAgeRestriction,
      publicationDate
    } = req.body

    const foundVideo: VideoType = db.find(v => v.id === +req.params.id)

    if (!foundVideo) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
      return
    }

    const errorMessages = videoParamsValidation(
      title,
      author,
      availableResolutions,
      minAgeRestriction,
      canBeDownloaded,
      publicationDate,
      true
    )

    if (errorMessages.errorsMessages.length) {
      res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errorMessages)
      return
    }

    foundVideo.author = author
    foundVideo.title = title
    foundVideo.availableResolutions = availableResolutions ?? foundVideo.availableResolutions
    foundVideo.minAgeRestriction = minAgeRestriction ?? foundVideo.minAgeRestriction
    foundVideo.publicationDate = publicationDate ?? foundVideo.publicationDate
    foundVideo.canBeDownloaded = canBeDownloaded ?? false

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
  })

  return router
}
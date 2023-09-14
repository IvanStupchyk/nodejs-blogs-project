import {CreateVideoErrorType} from "../types/types";
import {AvailableResolutionsEnum} from "../db/db";

export const videoParamsValidation = (
  title: string,
  author: string,
  availableResolutions: any,
  minAgeRestriction?: any,
  canBeDownloaded?: any,
  publicationDate?: any,
  additionalValidation = false
) => {
  let errorMessages: CreateVideoErrorType = {
    errorsMessages: []
  }

  if (!title || !title.length || title.trim().length > 40) {
    errorMessages.errorsMessages.push({
      message: 'Invalid title',
      field: 'title'
    })
  }

  if (!author || !author.length || author.trim().length > 20) {
    errorMessages.errorsMessages.push({
      message: 'Invalid author',
      field: 'author'
    })
  }

  if (Array.isArray(availableResolutions) && availableResolutions.length) {
    availableResolutions.forEach(r => {
      if (!AvailableResolutionsEnum[r]) {
        errorMessages.errorsMessages.push({
          message: 'Invalid availableResolutions',
          field: 'availableResolutions'
        })
      }
    })
  }

  if ((Array.isArray(availableResolutions) && availableResolutions.length === 0) ||
    (availableResolutions != null && !Array.isArray(availableResolutions))
  ) {
    errorMessages.errorsMessages.push({
      message: 'Invalid availableResolutions',
      field: 'availableResolutions'
    })
  }


  if (additionalValidation) {
    if (!Number.isInteger(minAgeRestriction) ||
      (Number.isInteger(minAgeRestriction) && (minAgeRestriction < 1 || minAgeRestriction > 18))
    ) {
      errorMessages.errorsMessages.push({
        message: 'Invalid minAgeRestriction',
        field: 'minAgeRestriction'
      })
    }

    if (typeof canBeDownloaded !== 'boolean' && typeof canBeDownloaded !== 'undefined') {
      errorMessages.errorsMessages.push({
        message: 'Invalid canBeDownloaded',
        field: 'canBeDownloaded'
      })
    }

    if (typeof publicationDate !== 'string' && typeof publicationDate !== 'undefined') {
      errorMessages.errorsMessages.push({
        message: 'Invalid publicationDate',
        field: 'publicationDate'
      })
    }
  }

  return errorMessages
}
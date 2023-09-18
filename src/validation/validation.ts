import {CreateVideoErrorType} from "../types/types";
import {AvailableResolutionsEnum, VideoType} from "../db/db";

const errorMessageGenerator = (
  errorsMessages: CreateVideoErrorType,
  field: keyof VideoType
): void => {
  errorsMessages.errorsMessages.push({
    message: `Invalid ${field}`,
    field
  })
}

export const videoFieldsValidation = (
  title: string,
  author: string,
  availableResolutions: Array<AvailableResolutionsEnum> | null,
  minAgeRestriction?: any,
  canBeDownloaded?: any,
  publicationDate?: any,
  additionalValidation = false
) => {
  let errorMessages: CreateVideoErrorType = {
    errorsMessages: []
  }

  if (!title || !title.length || Array.isArray(title) || title.trim().length > 40) {
    errorMessageGenerator(errorMessages, 'title')
  }

  if (!author || !author.length || Array.isArray(author) || author.trim().length > 20) {
    errorMessageGenerator(errorMessages, 'author')
  }

  if (Array.isArray(availableResolutions) && availableResolutions.length) {
    availableResolutions.forEach(r => {
      if (!AvailableResolutionsEnum[r]) {
        errorMessageGenerator(errorMessages, 'availableResolutions')
      }
    })
  }

  if ((Array.isArray(availableResolutions) && availableResolutions.length === 0) ||
    (availableResolutions != null && !Array.isArray(availableResolutions))
  ) {
    errorMessageGenerator(errorMessages, 'availableResolutions')
  }

  if (additionalValidation) {
    if ((typeof minAgeRestriction !== 'undefined' && !Number.isInteger(minAgeRestriction)) ||
      (Number.isInteger(minAgeRestriction) && (minAgeRestriction < 1 || minAgeRestriction > 18))
    ) {
      errorMessageGenerator(errorMessages, 'minAgeRestriction')
    }

    if (typeof canBeDownloaded !== 'boolean' && typeof canBeDownloaded !== 'undefined') {
      errorMessageGenerator(errorMessages, 'canBeDownloaded')
    }

    if (typeof publicationDate !== 'string' && typeof publicationDate !== 'undefined') {
      errorMessageGenerator(errorMessages, 'publicationDate')
    }
  }

  return errorMessages
}
import {AvailableResolutionsEnum} from "../../../db/db";

export type UpdateVideoModel = {
  title: string,
  author: string,
  availableResolutions: Array<AvailableResolutionsEnum> | null
  canBeDownloaded?: boolean
  minAgeRestriction?: number | null
  publicationDate?: string
}
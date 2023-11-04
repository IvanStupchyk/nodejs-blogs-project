import {SortOrder} from "../constants/sortOrder";
import {SortConditionsType} from "../types/generalTypes";

export const countSkipSizeForDb = (pageNumber: number, pageSize: number): number => {
  return pageNumber === 1
    ? 0
    : Math.trunc((pageNumber - 1) * pageSize)
}

export const getPagesCount = (entityCount: number, pageSize: number): number => {
  return Math.ceil(entityCount / pageSize)
}

export const createDefaultSortedParams = (sortConditions: SortConditionsType) => {
  const {
    pageNumber,
    pageSize,
    sortDirection,
    sortBy,
    model
  } = sortConditions

  const parsedPageNumber = parseInt(pageNumber)
  const parsedPageSize = parseInt(pageSize)

  const finalPageNumber = (!isNaN(parsedPageNumber) && parsedPageNumber > 0)
    ? parsedPageNumber
    : 1
  const finalPageSize = (!isNaN(parsedPageSize) && parsedPageSize > 0)
    ? parsedPageSize
    : 10

  const skipSize = countSkipSizeForDb(finalPageNumber, finalPageSize)
  const finalSortBy = model.hasOwnProperty(sortBy) ? sortBy : 'createdAt'
  const finalSortDirection = sortDirection === 'asc' ? sortDirection : SortOrder.desc

  return {
    pageNumber: finalPageNumber,
    pageSize: finalPageSize,
    skipSize,
    sortBy: finalSortBy,
    sortDirection: finalSortDirection
  }
}

export const HTTP_STATUSES = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,

  BAD_REQUEST_400: 400,
  UNAUTHORIZED_401: 401,
  FORBIDDEN_403: 403,
  NOT_FOUND_404: 404,
  TOO_MANY_REQUESTS_429: 429
}

type HttpStatusKeys = keyof typeof HTTP_STATUSES
export type HttpStatusType = (typeof HTTP_STATUSES)[HttpStatusKeys]
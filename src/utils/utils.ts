export const countSkipSizeForDb = (pageNumber: number, pageSize: number): number => {
  return pageNumber === 1
    ? 0
    : Math.trunc((pageNumber - 1) * pageSize)
}
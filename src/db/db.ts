export enum AvailableResolutionsEnum {
  P144 = 'P144',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160'
}


export type VideoType = {
  id: number,
  title: string
  author: string
  canBeDownloaded: boolean
  minAgeRestriction: number | null
  createdAt: string
  publicationDate: string
  availableResolutions: Array<AvailableResolutionsEnum> | null
}

export const db: DBType = [
  {
    id: 2,
    title: "string",
    author: "string",
    canBeDownloaded: true,
    minAgeRestriction: null,
    createdAt: "2023-09-14T14:36:30.434Z",
    publicationDate: "2023-09-14T14:36:30.434Z",
    availableResolutions: [
      AvailableResolutionsEnum.P144
    ]
  }
]

export type DBType = VideoType[]



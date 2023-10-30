import {CommentatorInfoType, CommentLikesInfoType} from "../../../types/generalTypes";

export type CommentViewModel = {
  id: string,
  content: string
  commentatorInfo: CommentatorInfoType
  likesInfo: CommentLikesInfoType
  createdAt: string
}
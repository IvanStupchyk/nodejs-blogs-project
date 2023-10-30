import {CommentatorInfoType, CommentLikesViewType} from "../../../types/generalTypes";

export type CommentViewModel = {
  id: string,
  content: string
  commentatorInfo: CommentatorInfoType
  likesInfo: CommentLikesViewType
  createdAt: string
}
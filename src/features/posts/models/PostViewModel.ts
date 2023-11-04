import {ObjectId} from "mongodb";
import {ExtendedLikesInfoViewType} from "../../../types/generalTypes";

export type PostViewModel = {
  id: ObjectId,
  title: string,
  shortDescription: string,
  content: string,
  createdAt: string,
  blogId: ObjectId
  blogName: string
  extendedLikesInfo: ExtendedLikesInfoViewType
}
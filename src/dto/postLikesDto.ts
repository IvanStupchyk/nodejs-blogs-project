import {ObjectId} from "mongodb";
import {CommentStatus} from "../types/generalTypes";

export class PostLikesType {
  constructor(public id: ObjectId,
              public userId: ObjectId,
              public myStatus: CommentStatus,
              public postId: ObjectId,
              public addedAt: string
  ) {}
}
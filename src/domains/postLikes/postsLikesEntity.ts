import mongoose from "mongoose";
import {ObjectId} from "mongodb";
import {CommentStatus, PostsLikesInfo} from "../../types/generalTypes";
import {PostLikeModel} from "../../db/db";
import {HydratedPostLikesType} from "../../types/postsLikesTypes";

export const postLikeSchema = new mongoose.Schema<PostsLikesInfo>({
  id: {type: String, required: true},
  userId: {type: String, required: true},
  myStatus: {type: String, required: true},
  postId: {type: String, required: true},
  addedAt: {type: String, required: true}
})

postLikeSchema.method('updateExistingPostLike', function updateExistingPostLike(
  myStatus: CommentStatus
) {
  const that = this as HydratedPostLikesType

  that.myStatus = myStatus
  that.addedAt = new Date().toISOString()
})

postLikeSchema.static('makeInstance', function makeInstance(
  userId: ObjectId,
  postId: ObjectId,
  newStatus: CommentStatus
) {

  return new PostLikeModel({
    id: new ObjectId(),
    postId,
    addedAt: new Date().toISOString(),
    myStatus: newStatus,
    userId
  })
})

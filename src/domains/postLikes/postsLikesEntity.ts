import mongoose from "mongoose";
import {ObjectId} from "mongodb";
import {likeStatus} from "../../types/generalTypes";
import {PostLikeModel} from "../../db/db";
import {HydratedPostLikesType, PostsLikesInfoType} from "../../types/postsLikesTypes";

export const postLikeSchema = new mongoose.Schema<PostsLikesInfoType>({
  id: {type: String, required: true},
  userId: {type: String, required: true},
  myStatus: {type: String, required: true},
  postId: {type: String, required: true},
  addedAt: {type: String, required: true}
})

postLikeSchema.method('updateExistingPostLike', function updateExistingPostLike(
  myStatus: likeStatus
) {
  const that = this as HydratedPostLikesType

  that.myStatus = myStatus
  that.addedAt = new Date().toISOString()
})

postLikeSchema.static('makeInstance', function makeInstance(
  userId: ObjectId,
  postId: ObjectId,
  newStatus: likeStatus
) {

  return new PostLikeModel({
    id: new ObjectId(),
    postId,
    addedAt: new Date().toISOString(),
    myStatus: newStatus,
    userId
  })
})

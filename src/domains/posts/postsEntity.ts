import mongoose from "mongoose";
import {PostType} from "../../dto/postDto";
import {PostModel} from "../../db/db";
import {ObjectId} from "mongodb";
import {HydratedPostType} from "../../types/postsTypes";
import {extendedPostLikesInfoSchema} from "../../schemas/extendedPostLikesInfo";
import {ExtendedLikesInfoType, PostLikeUserInfo} from "../../types/generalTypes";

export const postSchema = new mongoose.Schema<PostType>({
  id: {type: String, required: true},
  title: {type: String, required: true},
  shortDescription: {type: String, required: true},
  content: {type: String, required: true},
  blogId: {type: String, required: true},
  blogName: {type: String, required: true},
  createdAt: {type: String, required: true},
  extendedLikesInfo: extendedPostLikesInfoSchema
})

postSchema.method('updatePost', function updatePost(
  title: string,
  content: string,
  shortDescription: string,
) {
  const that = this as HydratedPostType

  that.content = content
  that.title = title
  that.shortDescription = shortDescription
})

postSchema.method('changeLikesCount', function changeLikesCount(
  likesCount: number,
  dislikesCount: number
) {
  const that = this as HydratedPostType

  that.extendedLikesInfo.likesCount = likesCount
  that.extendedLikesInfo.dislikesCount = dislikesCount
})

postSchema.method('setNewUserPostLike', function setNewUserPostLike(newestLike: PostLikeUserInfo) {
    const that = this as HydratedPostType

    that.extendedLikesInfo.newestLikes.push(newestLike)
})

postSchema.static('makeInstance', function makeInstance(
  title: string,
  shortDescription: string,
  content: string,
  blogId: ObjectId,
  blogName: string
) {
  const extendedLikesInfo: ExtendedLikesInfoType = {
    likesCount: 0,
    dislikesCount: 0,
    newestLikes: []
  }

  return new PostModel({
    id: new ObjectId(),
    title,
    shortDescription,
    content,
    blogId,
    createdAt: new Date().toISOString(),
    blogName,
    extendedLikesInfo
  })
})

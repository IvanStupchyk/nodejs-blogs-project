import {PostLikeModel} from "../../db/db"
import {ObjectId} from "mongodb";
import 'reflect-metadata'
import {injectable} from "inversify";
import {HydratedPostLikesType} from "../../types/postsLikesTypes";

@injectable()
export class LikesQueryRepository {
  async findPostLikeByUserIdAndPostId(userId: ObjectId, postId: ObjectId): Promise<HydratedPostLikesType | null> {
    return PostLikeModel.findOne({userId, postId})
  }

  async fetchAllUserLikeByUserId(userId: ObjectId): Promise<HydratedPostLikesType | null> {
    return PostLikeModel.find({userId}).lean()
  }

  async getLastThreePostLikes(postId: ObjectId): Promise<any | null> {
    return PostLikeModel
      .find({postId}, {_id: 0, _v: 0, id: 0, myStatus: 0, postId: 0})
      .sort({addedAt: 'desc'})
      .limit(3)
      .exec()
  }
}
import {PostLikeModel} from "../../db/db"
import {ObjectId} from "mongodb";
import 'reflect-metadata'
import {injectable} from "inversify";
import {HydratedPostLikesType} from "../../types/postsLikesTypes";
import {PostLikesType} from "../../dto/postLikesDto";

@injectable()
export class LikesQueryRepository {
  async findPostLikeByUserIdAndPostId(userId: ObjectId, postId: ObjectId): Promise<HydratedPostLikesType | null> {
    return PostLikeModel.findOne({userId, postId})
  }

  async fetchAllUserLikeByUserId(userId: ObjectId): Promise<Array<PostLikesType> | null> {
    return PostLikeModel.find({userId}).lean()
  }
}
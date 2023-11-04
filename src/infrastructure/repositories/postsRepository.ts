import {PostModel} from "../../db/db"
import 'reflect-metadata'
import {injectable} from "inversify";
import {HydratedPostType} from "../../types/postsTypes";
import {ObjectId} from "mongodb";
import {PostLikeUserInfo} from "../../types/generalTypes";

@injectable()
export class PostsRepository {
  async save(model: HydratedPostType) {
    return await model.save()
  }

  async addNewUserLikeInfo(id: ObjectId, newestLike: PostLikeUserInfo): Promise<boolean> {
    return !!await PostModel.findOneAndUpdate({id}, {
      $push: {'extendedLikesInfo.newestLikes': newestLike}
    }).exec()
  }

  async deleteUserLikeInfo(id: ObjectId, userId: ObjectId): Promise<boolean> {
    return !!await PostModel.updateOne(
      {id},
      {$pull: {
        'extendedLikesInfo.newestLikes': {userId}}
      })
      .exec()
  }


  async deletePost(id: ObjectId): Promise<boolean> {
    const deletedPost = await PostModel.deleteOne({id}).exec()

    return deletedPost.deletedCount === 1
  }
}
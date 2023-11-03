import {PostModel} from "../../db/db"
import 'reflect-metadata'
import {injectable} from "inversify";
import {HydratedPostType} from "../../types/postsTypes";
import {ObjectId} from "mongodb";

@injectable()
export class PostsRepository {
  async save(model: HydratedPostType) {
    return await model.save()
  }

  async deletePost(id: ObjectId): Promise<boolean> {
    const deletedPost = await PostModel.deleteOne({id}).exec()

    return deletedPost.deletedCount === 1
  }
}
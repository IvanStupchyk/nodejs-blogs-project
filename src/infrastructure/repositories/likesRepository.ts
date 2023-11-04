import 'reflect-metadata'
import {injectable} from "inversify";
import {HydratedPostLikesType} from "../../types/postsLikesTypes";

@injectable()
export class LikesRepository {
  async save(model: HydratedPostLikesType) {
    return await model.save()
  }
}
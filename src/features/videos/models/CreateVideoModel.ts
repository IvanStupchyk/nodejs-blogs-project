import {AvailableResolutionsEnum} from "../../../db/db";

export type CreateVideoModel = {
  title: string,
  author: string,
  availableResolutions: Array<AvailableResolutionsEnum>
}
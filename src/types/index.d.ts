import {ViewUserModel} from "../features/users/models/ViewUserModel";
import {ObjectId} from "mongodb";

declare global {
  namespace Express {
    export interface Request {
      user: ViewUserModel | null
    }
  }
}

declare global {
  namespace Express {
    export interface Request {
      userId: ObjectId,
      deviceId: ObjectId
    }
  }
}
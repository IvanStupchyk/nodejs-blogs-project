import {ViewUserModel} from "../features/users/models/ViewUserModel";

declare global {
  namespace Express {
    export interface Request {
      user: ViewUserModel | null
    }
  }
}
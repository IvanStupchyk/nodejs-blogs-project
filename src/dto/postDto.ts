import {ObjectId} from "mongodb";

export class PostType {
  constructor(public id: ObjectId,
              public title: string,
              public shortDescription: string,
              public content: string,
              public blogId: ObjectId,
              public createdAt: string,
              public blogName: string,
  ) {}
}
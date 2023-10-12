import {commentsCollections} from "../db/db"
import {CommentsType} from "../types/generalTypes";
import {createDefaultSortedParams, getPagesCount} from "../utils/utils";
import {mockCommentModel} from "../constants/blanks";
import {GetSortedCommentsModel} from "../features/comments/models/GetSortedCommentsModel";
import {CommentViewModel} from "../features/comments/models/CommentViewModel";

export const commentsQueryRepository = {
  async findCommentById(id: string): Promise<CommentViewModel | null> {
    const foundComment = await commentsCollections.findOne({id}, {projection: {_id: 0}})

    return foundComment ?
      {
        id: foundComment.id,
        content: foundComment.content,
        commentatorInfo: {
          userId: foundComment.commentatorInfo.userId,
          userLogin: foundComment.commentatorInfo.userLogin
        },
        createdAt: foundComment.createdAt
      } : null
  },

  async getSortedComments(params: GetSortedCommentsModel, postId: string): Promise<CommentsType> {
    const {
      pageNumber,
      pageSize,
      skipSize,
      sortBy,
      sortDirection
    } = createDefaultSortedParams({
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      model: mockCommentModel
    })

    const comments = await commentsCollections
      .find({postId}, { projection: {_id: 0}})
      .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
      .skip(skipSize)
      .limit(pageSize)
      .toArray()

    const commentsCount = await commentsCollections.countDocuments({postId})

    const pagesCount = getPagesCount(commentsCount, pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: commentsCount,
      items: comments.map(c => {
        return {
          id: c.id,
          content: c.content,
          commentatorInfo: {
            userId: c.commentatorInfo.userId,
            userLogin: c.commentatorInfo.userLogin
          },
          createdAt: c.createdAt
        }
      })
    }
  },
}
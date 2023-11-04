import {CommentStatus} from "../types/generalTypes";

type LikesInfoType = {
  likesCount: number
  dislikesCount: number
}

export const likesCounter = (
  myStatus: string,
  initialNewStatus: CommentStatus,
  initialStatus: CommentStatus | undefined,
  initialLikesInfo: LikesInfoType
): {likesInfo: LikesInfoType, newStatus: CommentStatus}=> {
  let newStatus: CommentStatus = initialNewStatus

  const likesInfo = {...initialLikesInfo}

  if (initialStatus) {
    if (myStatus === 'Like' && initialStatus === 'Dislike') {
      likesInfo.likesCount = ++likesInfo.likesCount
      likesInfo.dislikesCount = --likesInfo.dislikesCount
      newStatus = CommentStatus.Like
    }

    if (myStatus === 'Like' && initialStatus === 'None') {
      likesInfo.likesCount = ++likesInfo.likesCount
      newStatus = CommentStatus.Like
    }

    if (myStatus === 'Dislike' && initialStatus === 'Like') {
      likesInfo.dislikesCount = ++likesInfo.dislikesCount
      likesInfo.likesCount = --likesInfo.likesCount
      newStatus = CommentStatus.Dislike
    }

    if (myStatus === 'Dislike' && initialStatus === 'None') {
      likesInfo.dislikesCount = ++likesInfo.dislikesCount
      newStatus = CommentStatus.Dislike
    }

    if (myStatus === 'None' && initialStatus === 'Like') {
      likesInfo.likesCount = --likesInfo.likesCount
      newStatus = CommentStatus.None
    }

    if (myStatus === 'None' && initialStatus === 'Dislike') {
      likesInfo.dislikesCount = --likesInfo.dislikesCount
      newStatus = CommentStatus.None
    }
  } else {
    switch (myStatus) {
      case 'Like':
        likesInfo.likesCount = ++likesInfo.likesCount
        newStatus = CommentStatus.Like
        break
      case 'Dislike':
        likesInfo.dislikesCount = ++likesInfo.dislikesCount
        newStatus = CommentStatus.Dislike
        break
      default: return {likesInfo, newStatus}
    }
  }

  return {likesInfo, newStatus}
}
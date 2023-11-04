import {PostsLikesInfoType} from "../../../types/postsLikesTypes";
import {likeStatus} from "../../../types/generalTypes";
import {PostLikesType} from "../../../dto/postLikesDto";
import {PostViewModel} from "../../../features/posts/models/PostViewModel";
import {PostType} from "../../../dto/postDto";

export const getPostsMapper = (posts: Array<PostType>, usersPostsLikes: Array<PostLikesType> | null): Array<PostViewModel> => {
  return posts.map(post => {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: usersPostsLikes?.find((up: PostsLikesInfoType) => up.postId === post.id)?.myStatus ?? likeStatus.None,
        newestLikes: post.extendedLikesInfo.newestLikes
          .sort((a: any, b: any) => new Date(b.addedAt).valueOf() - new Date(a.addedAt).valueOf())
          .slice(0, 3)
      }
    }
  })
}
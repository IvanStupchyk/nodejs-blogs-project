import 'reflect-metadata'
import {PostsQueryRepository} from "../infrastructure/repositories/postsQueryRepository";
import {CommentsService} from "../domains/comments/comments.service";
import {UsersRepository} from "../infrastructure/repositories/usersRepository";
import {UsersQueryRepository} from "../infrastructure/repositories/usersQueryRepository";
import {CommentsRepository} from "../infrastructure/repositories/comentsRepository";
import {CommentsQueryRepository} from "../infrastructure/repositories/comentsQueryRepository";
import {PostsService} from "../domains/posts/posts.service";
import {PostsRepository} from "../infrastructure/repositories/postsRepository";
import {Container} from "inversify";
import {BlogsQueryRepository} from "../infrastructure/repositories/blogsQueryRepository";
import {LikesQueryRepository} from "../infrastructure/repositories/likesQueryRepository";
import {LikesRepository} from "../infrastructure/repositories/likesRepository";

export const postContainer = new Container()
postContainer.bind(UsersRepository).to(UsersRepository)
postContainer.bind(UsersQueryRepository).to(UsersQueryRepository)
postContainer.bind(CommentsRepository).to(CommentsRepository)
postContainer.bind(CommentsQueryRepository).to(CommentsQueryRepository)
postContainer.bind(PostsQueryRepository).to(PostsQueryRepository)
postContainer.bind(PostsRepository).to(PostsRepository)
postContainer.bind(BlogsQueryRepository).to(BlogsQueryRepository)
postContainer.bind(LikesQueryRepository).to(LikesQueryRepository)
postContainer.bind(LikesRepository).to(LikesRepository)
postContainer.bind(PostsService).to(PostsService)
postContainer.bind(CommentsService).to(CommentsService)
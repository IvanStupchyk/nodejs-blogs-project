import 'reflect-metadata'
import {BlogsQueryRepository} from "../infrastructure/repositories/blogsQueryRepository";
import {PostsQueryRepository} from "../infrastructure/repositories/postsQueryRepository";
import {BlogsService} from "../domains/blogs/blogs.service";
import {PostsService} from "../domains/posts/posts.service";
import {PostsRepository} from "../infrastructure/repositories/postsRepository";
import {BlogsRepository} from "../infrastructure/repositories/blogsRepository";
import {Container} from "inversify";
import {LikesQueryRepository} from "../infrastructure/repositories/likesQueryRepository";
import {LikesRepository} from "../infrastructure/repositories/likesRepository";


export const blogsContainer = new Container()
blogsContainer.bind(BlogsQueryRepository).to(BlogsQueryRepository)
blogsContainer.bind(BlogsRepository).to(BlogsRepository)
blogsContainer.bind(PostsQueryRepository).to(PostsQueryRepository)
blogsContainer.bind(PostsRepository).to(PostsRepository)
blogsContainer.bind(LikesQueryRepository).to(LikesQueryRepository)
blogsContainer.bind(LikesRepository).to(LikesRepository)
blogsContainer.bind(BlogsService).to(BlogsService)
blogsContainer.bind(PostsService).to(PostsService)
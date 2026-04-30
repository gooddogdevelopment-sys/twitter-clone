import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { ClerkJwtPayload } from '../auth/current-user.decorator';
import { LikesService } from '../likes/likes.service';
import { RepostsService } from '../repost/reposts.service';
import { CommentsService } from '../comments/comments.service';

@UseGuards(ClerkAuthGuard)
@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly likesService: LikesService,
    private readonly repostsService: RepostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @ResolveField(() => Int)
  likesCount(@Parent() post: Post): Promise<number> {
    return this.likesService.countLikes(post.id);
  }

  @ResolveField(() => Boolean)
  isLikedByCurrentUser(
    @Parent() post: Post,
    @Context() ctx: { req: { auth: ClerkJwtPayload } },
  ): Promise<boolean> {
    return this.likesService.isLikedByCurrentUser(post.id, ctx.req.auth.sub);
  }

  @ResolveField(() => Int)
  repostsCount(@Parent() post: Post): Promise<number> {
    return this.repostsService.countReposts(post.id);
  }

  @ResolveField(() => Int)
  commentsCount(@Parent() post: Post): Promise<number> {
    return this.commentsService.countComments(post.id);
  }

  @ResolveField(() => Boolean)
  isRepostedByCurrentUser(
    @Parent() post: Post,
    @Context() ctx: { req: { auth: ClerkJwtPayload } },
  ): Promise<boolean> {
    return this.repostsService.isRepostedByCurrentUser(
      post.id,
      ctx.req.auth.sub,
    );
  }

  @Mutation(() => Post)
  createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() currentUser: ClerkJwtPayload,
  ) {
    return this.postsService.create(createPostInput, currentUser.sub);
  }

  @Query(() => [Post], { name: 'posts' })
  findAll(@CurrentUser() currentUser: ClerkJwtPayload) {
    return this.postsService.findAll(currentUser.sub);
  }

  @Query(() => [Post], { name: 'feed' })
  getFeed(@CurrentUser() currentUser: ClerkJwtPayload) {
    return this.postsService.findFeed(currentUser.sub);
  }

  @Query(() => Post, { name: 'post' })
  findOne(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() currentUser: ClerkJwtPayload,
  ) {
    return this.postsService.findOne(id, currentUser.sub);
  }

  @Mutation(() => Post)
  updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput) {
    return this.postsService.update(updatePostInput.id, updatePostInput);
  }

  @Query(() => [Post], { name: 'postsByUser' })
  postsByUser(@Args('userId') userId: string) {
    return this.postsService.findByUserId(userId);
  }

  @Mutation(() => Post)
  removePost(@Args('id', { type: () => Int }) id: number) {
    return this.postsService.remove(id);
  }
}

import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { ClerkJwtPayload } from '../auth/current-user.decorator';

@UseGuards(ClerkAuthGuard)
@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Mutation(() => Comment)
  createComment(
    @Args('postId', { type: () => Int }) postId: number,
    @Args('content') content: string,
    @CurrentUser() currentUser: ClerkJwtPayload,
  ) {
    return this.commentsService.createComment(postId, content, currentUser.sub);
  }

  @Mutation(() => Boolean)
  deleteComment(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() currentUser: ClerkJwtPayload,
  ) {
    return this.commentsService.deleteComment(id, currentUser.sub);
  }

  @Query(() => [Comment], { name: 'commentsByPost' })
  getCommentsByPost(@Args('postId', { type: () => Int }) postId: number) {
    return this.commentsService.getCommentsByPost(postId);
  }
}

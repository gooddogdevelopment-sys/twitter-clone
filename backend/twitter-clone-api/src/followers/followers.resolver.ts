import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { Follower } from './entites/followers.entity';
import { CreateFollowerInput } from './dto/create-follower.input';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { ClerkJwtPayload } from '../auth/current-user.decorator';

@UseGuards(ClerkAuthGuard)
@Resolver(() => Follower)
export class FollowersResolver {
  constructor(private readonly followersService: FollowersService) {}

  @Mutation(() => Follower)
  follow(
    @Args('createFollowerInput') createFollowerInput: CreateFollowerInput,
    @CurrentUser() currentUser: ClerkJwtPayload,
  ) {
    return this.followersService.follow(
      createFollowerInput.userIdToFollow,
      currentUser.sub,
    );
  }

  @Mutation(() => Boolean)
  unfollow(
    @Args('userIdToUnfollow') userIdToUnfollow: string,
    @CurrentUser() currentUser: ClerkJwtPayload,
  ) {
    return this.followersService.unfollow(userIdToUnfollow, currentUser.sub);
  }

  @Query(() => Boolean, { name: 'isFollowing' })
  isFollowing(
    @Args('userId') userId: string,
    @CurrentUser() currentUser: ClerkJwtPayload,
  ) {
    return this.followersService.isFollowing(userId, currentUser.sub);
  }

  @Query(() => [Follower], { name: 'followers' })
  getFollowers(@Args('userId') userId: string) {
    return this.followersService.getFollowers(userId);
  }

  @Query(() => [Follower], { name: 'following' })
  getFollowing(@Args('userId') userId: string) {
    return this.followersService.getFollowing(userId);
  }
}

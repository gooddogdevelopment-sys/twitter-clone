import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ClerkAuthGuard } from '../auth/clerk.guard';

@UseGuards(ClerkAuthGuard)
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { name: 'getUserByUsername', nullable: true })
  getUserByUsername(@Args('username') username: string): Promise<User | null> {
    return this.usersService.findByUsername(username);
  }

  @Query(() => [User], { name: 'searchUsers' })
  searchUsers(@Args('query') query: string): Promise<User[]> {
    return this.usersService.searchByUsername(query);
  }
}

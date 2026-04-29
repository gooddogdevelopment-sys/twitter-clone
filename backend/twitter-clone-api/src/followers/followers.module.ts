import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowersService } from './followers.service';
import { FollowersResolver } from './followers.resolver';
import { Follower } from './entites/followers.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Follower]), UsersModule],
  providers: [FollowersResolver, FollowersService],
})
export class FollowersModule {}

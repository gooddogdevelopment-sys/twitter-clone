import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { Post } from './entities/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Follower } from '../followers/entites/followers.entity';
import { LikesModule } from '../likes/likes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Follower]),
    UsersModule,
    LikesModule,
  ],
  providers: [PostsResolver, PostsService],
})
export class PostsModule {}

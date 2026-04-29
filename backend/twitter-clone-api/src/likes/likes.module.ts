import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { LikesResolver } from './likes.resolver';
import { Likes } from './entities/likes.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Likes]), UsersModule],
  providers: [LikesResolver, LikesService],
  exports: [LikesService],
})
export class LikesModule {}

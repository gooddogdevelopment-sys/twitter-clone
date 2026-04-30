import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reposts } from './entities/reposts.entity';
import { UsersModule } from '../users/users.module';
import { RepostsService } from './reposts.service';
import { RepostsResolver } from './reposts.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Reposts]), UsersModule],
  providers: [RepostsService, RepostsResolver],
  exports: [RepostsService],
})
export class RepostsModule {}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reposts } from './entities/reposts.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class RepostsService {
  constructor(
    @InjectRepository(Reposts)
    private readonly repostsRepository: Repository<Reposts>,
    private readonly usersService: UsersService,
  ) {}
  async repost(postId: number, clerkId: string): Promise<Reposts> {
    const user = await this.usersService.findByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    const existing = await this.repostsRepository.findOne({
      where: { postId, userId: user.id },
    });

    if (existing) {
      existing.isActive = !existing.isActive;
      return this.repostsRepository.save(existing);
    }
    const repost = this.repostsRepository.create({
      postId,
      userId: user.id,
      isActive: true,
    });
    return this.repostsRepository.save(repost);
  }

  async countReposts(postId: number): Promise<number> {
    return this.repostsRepository.count({ where: { postId, isActive: true } });
  }

  async isRepostedByCurrentUser(
    postId: number,
    clerkId: string,
  ): Promise<boolean> {
    const user = await this.usersService.findByClerkId(clerkId);
    if (!user) return false;
    const repost = await this.repostsRepository.findOne({
      where: { postId, userId: user.id, isActive: true },
    });
    return !!repost;
  }
}

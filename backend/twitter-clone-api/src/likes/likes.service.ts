import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Likes } from './entities/likes.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Likes)
    private readonly likesRepository: Repository<Likes>,
    private readonly usersService: UsersService,
  ) {}
  async likePost(postId: number, clerkId: string): Promise<Likes> {
    const user = await this.usersService.findByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const existing = await this.likesRepository.findOne({
      where: { postId, userId: user.id },
    });
    if (existing) {
      existing.isActive = !existing.isActive;
      return this.likesRepository.save(existing);
    }
    const like = this.likesRepository.create({
      postId,
      userId: user.id,
      isActive: true,
    });
    return this.likesRepository.save(like);
  }

  async countLikes(postId: number): Promise<number> {
    return this.likesRepository.count({ where: { postId, isActive: true } });
  }
}

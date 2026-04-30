import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly usersService: UsersService,
  ) {}

  async createComment(postId: number, content: string, clerkId: string): Promise<Comment> {
    const user = await this.usersService.findByClerkId(clerkId);
    if (!user) throw new NotFoundException('User not found');

    const comment = this.commentsRepository.create({
      postId,
      userId: user.id,
      content,
    });
    return this.commentsRepository.save(comment);
  }

  async deleteComment(id: number, clerkId: string): Promise<boolean> {
    const user = await this.usersService.findByClerkId(clerkId);
    if (!user) throw new NotFoundException('User not found');

    const comment = await this.commentsRepository.findOneBy({ id });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== user.id) throw new ForbiddenException('Not your comment');

    await this.commentsRepository.delete(id);
    return true;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async countComments(postId: number): Promise<number> {
    return this.commentsRepository.count({ where: { postId } });
  }
}

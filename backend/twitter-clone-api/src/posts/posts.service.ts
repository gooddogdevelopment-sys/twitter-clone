import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { In, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Follower } from '../followers/entites/followers.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Follower)
    private readonly followersRepository: Repository<Follower>,
    private readonly usersService: UsersService,
  ) {}

  async create(createPostInput: CreatePostInput, clerkId: string) {
    const user = await this.usersService.findByClerkId(clerkId);
    if (!user) throw new NotFoundException('User not found');

    const post = this.postsRepository.create({
      ...createPostInput,
      userId: user.id,
    });
    return this.postsRepository.save(post);
  }

  async findAll(clerkId: string) {
    const user = await this.usersService.findByClerkId(clerkId);
    if (!user) throw new NotFoundException('User not found');
    return this.postsRepository.findBy({ userId: user.id });
  }

  async findOne(id: number, clerkId: string) {
    const user = await this.usersService.findByClerkId(clerkId);
    if (!user) throw new NotFoundException('User not found');
    return this.postsRepository.findOneBy({ id, userId: user.id });
  }

  async update(id: number, updatePostInput: UpdatePostInput) {
    const post = await this.postsRepository.preload({ ...updatePostInput });
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    return this.postsRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    await this.postsRepository.delete(id);
  }

  async findByUserId(userId: string): Promise<Post[]> {
    return this.postsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findFeed(clerkId: string): Promise<Post[]> {
    const currentUser = await this.usersService.findByClerkId(clerkId);
    if (!currentUser) throw new NotFoundException('User not found');

    // Collect IDs of all users the current user follows
    const following = await this.followersRepository.find({
      where: { followerUserId: currentUser.id },
      select: ['userId'],
    });
    const followedIds = following.map((f) => f.userId);

    // Include the current user's own posts in their feed
    const authorIds = [currentUser.id, ...followedIds];

    return this.postsRepository.find({
      where: { userId: In(authorIds) },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}

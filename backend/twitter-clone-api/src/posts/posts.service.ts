import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { In, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Follower } from '../followers/entites/followers.entity';
import { Reposts } from '../repost/entities/reposts.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Follower)
    private readonly followersRepository: Repository<Follower>,
    @InjectRepository(Reposts)
    private readonly repostsRepository: Repository<Reposts>,
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

    const following = await this.followersRepository.find({
      where: { followerUserId: currentUser.id },
      select: ['userId'],
    });
    const followedIds = following.map((f) => f.userId);
    const authorIds = [currentUser.id, ...followedIds];

    // Posts authored by followed users + self
    const authoredPosts = await this.postsRepository.find({
      where: { userId: In(authorIds) },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    const seenIds = new Set(authoredPosts.map((p) => p.id));

    // Active reposts by followed users + self, with reposter's user info
    const reposts = await this.repostsRepository.find({
      where: { userId: In(authorIds), isActive: true },
      relations: ['post', 'post.user', 'user'],
    });

    // Add reposted posts not already in the authored set
    const repostedPosts: Post[] = [];
    for (const repost of reposts) {
      if (!seenIds.has(repost.postId)) {
        const post = repost.post;
        post.repostedByUsername = repost.user.username;
        repostedPosts.push(post);
        seenIds.add(repost.postId);
      }
    }

    const allPosts = [...authoredPosts, ...repostedPosts];
    allPosts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return allPosts;
  }
}

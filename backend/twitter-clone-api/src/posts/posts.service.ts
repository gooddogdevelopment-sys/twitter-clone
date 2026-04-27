import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
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

  findAll() {
    return this.postsRepository.find();
  }

  findOne(id: number) {
    return this.postsRepository.findOneBy({ id });
  }

  async update(id: number, updatePostInput: UpdatePostInput) {
    const post = await this.postsRepository.preload({ ...updatePostInput });
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    return this.postsRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    await this.postsRepository.delete(id);
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follower } from './entites/followers.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class FollowersService {
  constructor(
    @InjectRepository(Follower)
    private readonly followersRepository: Repository<Follower>,
    private readonly usersService: UsersService,
  ) {}

  async follow(userIdToFollow: string, clerkId: string): Promise<Follower> {
    const currentUser = await this.usersService.findByClerkId(clerkId);
    if (!currentUser) throw new NotFoundException('Current user not found');

    const userToFollow = await this.usersService.findById(userIdToFollow);
    if (!userToFollow) throw new NotFoundException('User to follow not found');

    if (currentUser.id === userIdToFollow) {
      throw new ConflictException('You cannot follow yourself');
    }

    const existing = await this.followersRepository.findOne({
      where: { userId: userIdToFollow, followerUserId: currentUser.id },
    });
    if (existing) throw new ConflictException('Already following this user');

    const follower = this.followersRepository.create({
      userId: userIdToFollow,
      followerUserId: currentUser.id,
    });
    return this.followersRepository.save(follower);
  }

  async unfollow(userIdToUnfollow: string, clerkId: string): Promise<boolean> {
    const currentUser = await this.usersService.findByClerkId(clerkId);
    if (!currentUser) throw new NotFoundException('Current user not found');

    const result = await this.followersRepository.delete({
      userId: userIdToUnfollow,
      followerUserId: currentUser.id,
    });
    return (result.affected ?? 0) > 0;
  }

  async getFollowers(userId: string): Promise<Follower[]> {
    return this.followersRepository.find({
      where: { userId },
      relations: ['follower'],
    });
  }

  async getFollowing(userId: string): Promise<Follower[]> {
    return this.followersRepository.find({
      where: { followerUserId: userId },
      relations: ['user'],
    });
  }

  async isFollowing(targetUserId: string, clerkId: string): Promise<boolean> {
    const currentUser = await this.usersService.findByClerkId(clerkId);
    if (!currentUser) return false;
    const record = await this.followersRepository.findOne({
      where: { userId: targetUserId, followerUserId: currentUser.id },
    });
    return record !== null;
  }
}

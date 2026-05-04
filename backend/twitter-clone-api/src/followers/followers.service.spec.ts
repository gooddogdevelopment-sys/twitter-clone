import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { Follower } from './entites/followers.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

const mockCurrentUser: User = {
  id: 'user-uuid-1111',
  clerkId: 'clerk_current',
  username: 'currentuser',
  createdAt: new Date('2024-01-01'),
  posts: [],
  followers: [],
  following: [],
  likes: [],
  reposts: [],
  comments: [],
};

const mockTargetUser: User = {
  id: 'user-uuid-2222',
  clerkId: 'clerk_target',
  username: 'targetuser',
  createdAt: new Date('2024-01-01'),
  posts: [],
  followers: [],
  following: [],
  likes: [],
  reposts: [],
  comments: [],
};

const mockFollowerRecord: Follower = {
  id: 1,
  userId: mockTargetUser.id,
  followerUserId: mockCurrentUser.id,
  createdAt: new Date('2024-01-01'),
  user: mockTargetUser,
  follower: mockCurrentUser,
};

const mockFollowersRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
};

const mockUsersService = {
  findByClerkId: jest.fn(),
  findById: jest.fn(),
};

describe('FollowersService', () => {
  let service: FollowersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowersService,
        {
          provide: getRepositoryToken(Follower),
          useValue: mockFollowersRepository,
        },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<FollowersService>(FollowersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // follow
  // ---------------------------------------------------------------------------
  describe('follow', () => {
    it('should create and return a follower record when all conditions are met', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockCurrentUser);
      mockUsersService.findById.mockResolvedValue(mockTargetUser);
      mockFollowersRepository.findOne.mockResolvedValue(null);
      mockFollowersRepository.create.mockReturnValue(mockFollowerRecord);
      mockFollowersRepository.save.mockResolvedValue(mockFollowerRecord);

      const result = await service.follow(
        mockTargetUser.id,
        mockCurrentUser.clerkId,
      );

      expect(mockUsersService.findByClerkId).toHaveBeenCalledWith(
        mockCurrentUser.clerkId,
      );
      expect(mockUsersService.findById).toHaveBeenCalledWith(mockTargetUser.id);
      expect(mockFollowersRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: mockTargetUser.id,
          followerUserId: mockCurrentUser.id,
        },
      });
      expect(mockFollowersRepository.create).toHaveBeenCalledWith({
        userId: mockTargetUser.id,
        followerUserId: mockCurrentUser.id,
      });
      expect(mockFollowersRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockFollowerRecord);
    });

    it('should throw NotFoundException when the current user is not found', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(null);

      await expect(
        service.follow(mockTargetUser.id, 'clerk_unknown'),
      ).rejects.toThrow(NotFoundException);

      expect(mockUsersService.findById).not.toHaveBeenCalled();
      expect(mockFollowersRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the target user does not exist', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockCurrentUser);
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        service.follow('nonexistent-uuid', mockCurrentUser.clerkId),
      ).rejects.toThrow(NotFoundException);

      expect(mockFollowersRepository.findOne).not.toHaveBeenCalled();
      expect(mockFollowersRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when the user tries to follow themselves', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockCurrentUser);
      mockUsersService.findById.mockResolvedValue(mockCurrentUser);

      await expect(
        service.follow(mockCurrentUser.id, mockCurrentUser.clerkId),
      ).rejects.toThrow(ConflictException);

      expect(mockFollowersRepository.findOne).not.toHaveBeenCalled();
      expect(mockFollowersRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when the user is already following the target', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockCurrentUser);
      mockUsersService.findById.mockResolvedValue(mockTargetUser);
      mockFollowersRepository.findOne.mockResolvedValue(mockFollowerRecord);

      await expect(
        service.follow(mockTargetUser.id, mockCurrentUser.clerkId),
      ).rejects.toThrow(ConflictException);

      expect(mockFollowersRepository.create).not.toHaveBeenCalled();
      expect(mockFollowersRepository.save).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // unfollow
  // ---------------------------------------------------------------------------
  describe('unfollow', () => {
    it('should delete the follower record and return true when a follow relationship exists', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockCurrentUser);
      mockFollowersRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.unfollow(
        mockTargetUser.id,
        mockCurrentUser.clerkId,
      );

      expect(mockFollowersRepository.delete).toHaveBeenCalledWith({
        userId: mockTargetUser.id,
        followerUserId: mockCurrentUser.id,
      });
      expect(result).toBe(true);
    });

    it('should return false when no follow relationship existed to delete', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockCurrentUser);
      mockFollowersRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.unfollow(
        'user-uuid-9999',
        mockCurrentUser.clerkId,
      );

      expect(result).toBe(false);
    });

    it('should throw NotFoundException when the current user is not found', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(null);

      await expect(
        service.unfollow(mockTargetUser.id, 'clerk_unknown'),
      ).rejects.toThrow(NotFoundException);

      expect(mockFollowersRepository.delete).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getFollowers
  // ---------------------------------------------------------------------------
  describe('getFollowers', () => {
    it('should return the list of followers with the follower relation loaded', async () => {
      mockFollowersRepository.find.mockResolvedValue([mockFollowerRecord]);

      const result = await service.getFollowers(mockTargetUser.id);

      expect(mockFollowersRepository.find).toHaveBeenCalledWith({
        where: { userId: mockTargetUser.id },
        relations: ['follower'],
      });
      expect(result).toEqual([mockFollowerRecord]);
      expect(result).toHaveLength(1);
    });

    it('should return an empty array when the user has no followers', async () => {
      mockFollowersRepository.find.mockResolvedValue([]);

      const result = await service.getFollowers('user-uuid-9999');

      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // getFollowing
  // ---------------------------------------------------------------------------
  describe('getFollowing', () => {
    it('should return the list of followed users with the user relation loaded', async () => {
      mockFollowersRepository.find.mockResolvedValue([mockFollowerRecord]);

      const result = await service.getFollowing(mockCurrentUser.id);

      expect(mockFollowersRepository.find).toHaveBeenCalledWith({
        where: { followerUserId: mockCurrentUser.id },
        relations: ['user'],
      });
      expect(result).toEqual([mockFollowerRecord]);
      expect(result).toHaveLength(1);
    });

    it('should return an empty array when the user is not following anyone', async () => {
      mockFollowersRepository.find.mockResolvedValue([]);

      const result = await service.getFollowing('user-uuid-9999');

      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // isFollowing
  // ---------------------------------------------------------------------------
  describe('isFollowing', () => {
    it('should return true when an active follow relationship exists', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockCurrentUser);
      mockFollowersRepository.findOne.mockResolvedValue(mockFollowerRecord);

      const result = await service.isFollowing(
        mockTargetUser.id,
        mockCurrentUser.clerkId,
      );

      expect(mockFollowersRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: mockTargetUser.id,
          followerUserId: mockCurrentUser.id,
        },
      });
      expect(result).toBe(true);
    });

    it('should return false when no follow relationship exists', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockCurrentUser);
      mockFollowersRepository.findOne.mockResolvedValue(null);

      const result = await service.isFollowing(
        mockTargetUser.id,
        mockCurrentUser.clerkId,
      );

      expect(result).toBe(false);
    });

    it('should return false without querying the DB when the current user is not found', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(null);

      const result = await service.isFollowing(
        mockTargetUser.id,
        'clerk_unknown',
      );

      expect(mockFollowersRepository.findOne).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});

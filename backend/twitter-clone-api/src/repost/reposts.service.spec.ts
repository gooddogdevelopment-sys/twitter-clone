import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { RepostsService } from './reposts.service';
import { Reposts } from './entities/reposts.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';

const mockUser: User = {
  id: 'user-uuid-1234',
  clerkId: 'clerk_test123',
  username: 'testuser',
  createdAt: new Date('2024-01-01'),
  posts: [],
  followers: [],
  following: [],
  likes: [],
  reposts: [],
  comments: [],
};

const mockRepost: Reposts = {
  id: 1,
  postId: 42,
  userId: mockUser.id,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  user: mockUser,
  post: null as unknown as Post,
};

const mockRepostsRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
};

const mockUsersService = {
  findByClerkId: jest.fn(),
};

describe('RepostsService', () => {
  let service: RepostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepostsService,
        {
          provide: getRepositoryToken(Reposts),
          useValue: mockRepostsRepository,
        },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<RepostsService>(RepostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // repost
  // ---------------------------------------------------------------------------
  describe('repost', () => {
    it('should create and return a new repost when one does not already exist', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockRepostsRepository.findOne.mockResolvedValue(null);
      mockRepostsRepository.create.mockReturnValue(mockRepost);
      mockRepostsRepository.save.mockResolvedValue(mockRepost);

      const result = await service.repost(42, mockUser.clerkId);

      expect(mockUsersService.findByClerkId).toHaveBeenCalledWith(
        mockUser.clerkId,
      );
      expect(mockRepostsRepository.findOne).toHaveBeenCalledWith({
        where: { postId: 42, userId: mockUser.id },
      });
      expect(mockRepostsRepository.create).toHaveBeenCalledWith({
        postId: 42,
        userId: mockUser.id,
        isActive: true,
      });
      expect(mockRepostsRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockRepost);
    });

    it('should toggle isActive to false and return the updated repost when an active repost already exists', async () => {
      const activeRepost = { ...mockRepost, isActive: true };
      const toggledRepost = { ...mockRepost, isActive: false };
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockRepostsRepository.findOne.mockResolvedValue(activeRepost);
      mockRepostsRepository.save.mockResolvedValue(toggledRepost);

      const result = await service.repost(42, mockUser.clerkId);

      expect(mockRepostsRepository.create).not.toHaveBeenCalled();
      expect(activeRepost.isActive).toBe(false);
      expect(result.isActive).toBe(false);
    });

    it('should toggle isActive back to true when re-reposting an inactive repost', async () => {
      const inactiveRepost = { ...mockRepost, isActive: false };
      const toggledRepost = { ...mockRepost, isActive: true };
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockRepostsRepository.findOne.mockResolvedValue(inactiveRepost);
      mockRepostsRepository.save.mockResolvedValue(toggledRepost);

      const result = await service.repost(42, mockUser.clerkId);

      expect(mockRepostsRepository.create).not.toHaveBeenCalled();
      expect(inactiveRepost.isActive).toBe(true);
      expect(result.isActive).toBe(true);
    });

    it('should throw NotFoundException when the clerkId does not match any user', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(null);

      await expect(service.repost(42, 'clerk_unknown')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockRepostsRepository.findOne).not.toHaveBeenCalled();
      expect(mockRepostsRepository.create).not.toHaveBeenCalled();
      expect(mockRepostsRepository.save).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // countReposts
  // ---------------------------------------------------------------------------
  describe('countReposts', () => {
    it('should return the total number of active reposts for a post', async () => {
      mockRepostsRepository.count.mockResolvedValue(3);

      const result = await service.countReposts(42);

      expect(mockRepostsRepository.count).toHaveBeenCalledWith({
        where: { postId: 42, isActive: true },
      });
      expect(result).toBe(3);
    });

    it('should return 0 when a post has no active reposts', async () => {
      mockRepostsRepository.count.mockResolvedValue(0);

      const result = await service.countReposts(42);

      expect(result).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // isRepostedByCurrentUser
  // ---------------------------------------------------------------------------
  describe('isRepostedByCurrentUser', () => {
    it('should return true when an active repost exists for the user and post', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockRepostsRepository.findOne.mockResolvedValue(mockRepost);

      const result = await service.isRepostedByCurrentUser(
        42,
        mockUser.clerkId,
      );

      expect(mockRepostsRepository.findOne).toHaveBeenCalledWith({
        where: { postId: 42, userId: mockUser.id, isActive: true },
      });
      expect(result).toBe(true);
    });

    it('should return false when no active repost exists for the user and post', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockRepostsRepository.findOne.mockResolvedValue(null);

      const result = await service.isRepostedByCurrentUser(
        42,
        mockUser.clerkId,
      );

      expect(result).toBe(false);
    });

    it('should return false without querying the DB when the current user is not found', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(null);

      const result = await service.isRepostedByCurrentUser(42, 'clerk_unknown');

      expect(mockRepostsRepository.findOne).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});

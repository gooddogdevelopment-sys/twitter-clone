import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { LikesService } from './likes.service';
import { Likes } from './entities/likes.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';

const mockUser = {
  id: 'user-uuid-1234',
  clerkId: 'clerk_test123',
  username: 'testuser',
};

const mockLike: Likes = {
  id: 1,
  postId: 42,
  userId: mockUser.id,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  user: mockUser as User,
  post: null as unknown as Post,
};

const mockLikesRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
};

const mockUsersService = {
  findByClerkId: jest.fn(),
};

describe('LikesService', () => {
  let service: LikesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        { provide: getRepositoryToken(Likes), useValue: mockLikesRepository },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // likePost
  // ---------------------------------------------------------------------------
  describe('likePost', () => {
    it('should create and return a new like when one does not already exist', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockLikesRepository.findOne.mockResolvedValue(null);
      mockLikesRepository.create.mockReturnValue(mockLike);
      mockLikesRepository.save.mockResolvedValue(mockLike);

      const result = await service.likePost(42, mockUser.clerkId);

      expect(mockLikesRepository.create).toHaveBeenCalledWith({
        postId: 42,
        userId: mockUser.id,
        isActive: true,
      });
      expect(mockLikesRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockLike);
    });

    it('should toggle isActive and return the updated like when a like already exists (unlike)', async () => {
      const activeLike = { ...mockLike, isActive: true };
      const toggledLike = { ...mockLike, isActive: false };
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockLikesRepository.findOne.mockResolvedValue(activeLike);
      mockLikesRepository.save.mockResolvedValue(toggledLike);

      const result = await service.likePost(42, mockUser.clerkId);

      expect(mockLikesRepository.create).not.toHaveBeenCalled();
      expect(activeLike.isActive).toBe(false);
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when the clerkId does not match any user', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(null);

      await expect(service.likePost(42, 'clerk_unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // countLikes
  // ---------------------------------------------------------------------------
  describe('countLikes', () => {
    it('should return the total number of active likes for a post', async () => {
      mockLikesRepository.count.mockResolvedValue(5);

      const result = await service.countLikes(42);

      expect(mockLikesRepository.count).toHaveBeenCalledWith({
        where: { postId: 42, isActive: true },
      });
      expect(result).toBe(5);
    });

    it('should return 0 when a post has no active likes', async () => {
      mockLikesRepository.count.mockResolvedValue(0);

      const result = await service.countLikes(42);

      expect(result).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // isLikedByCurrentUser
  // ---------------------------------------------------------------------------
  describe('isLikedByCurrentUser', () => {
    it('should return true when an active like exists for the user and post', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockLikesRepository.findOne.mockResolvedValue(mockLike);

      const result = await service.isLikedByCurrentUser(42, mockUser.clerkId);

      expect(mockLikesRepository.findOne).toHaveBeenCalledWith({
        where: { postId: 42, userId: mockUser.id, isActive: true },
      });
      expect(result).toBe(true);
    });

    it('should return false when no active like exists for the user and post', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockLikesRepository.findOne.mockResolvedValue(null);

      const result = await service.isLikedByCurrentUser(42, mockUser.clerkId);

      expect(result).toBe(false);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
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

const mockComment: Comment = {
  id: 1,
  postId: 42,
  userId: mockUser.id,
  content: 'This is a test comment',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  user: mockUser,
  post: null as unknown as Post,
};

const mockCommentsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockUsersService = {
  findByClerkId: jest.fn(),
};

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentsRepository,
        },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // createComment
  // ---------------------------------------------------------------------------
  describe('createComment', () => {
    it('should create, save, and return a comment with the user attached', async () => {
      const savedComment = { ...mockComment, user: undefined } as unknown as Comment;
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockCommentsRepository.create.mockReturnValue(savedComment);
      mockCommentsRepository.save.mockResolvedValue(savedComment);

      const result = await service.createComment(
        42,
        'This is a test comment',
        mockUser.clerkId,
      );

      expect(mockUsersService.findByClerkId).toHaveBeenCalledWith(
        mockUser.clerkId,
      );
      expect(mockCommentsRepository.create).toHaveBeenCalledWith({
        postId: 42,
        userId: mockUser.id,
        content: 'This is a test comment',
      });
      expect(mockCommentsRepository.save).toHaveBeenCalled();
      expect(result.user).toEqual(mockUser);
    });

    it('should throw NotFoundException when the clerkId does not match any user', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(null);

      await expect(
        service.createComment(42, 'Hello', 'clerk_unknown'),
      ).rejects.toThrow(NotFoundException);

      expect(mockCommentsRepository.create).not.toHaveBeenCalled();
      expect(mockCommentsRepository.save).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // deleteComment
  // ---------------------------------------------------------------------------
  describe('deleteComment', () => {
    it('should delete the comment and return true when the user owns the comment', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockCommentsRepository.findOneBy.mockResolvedValue(mockComment);
      mockCommentsRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteComment(
        mockComment.id,
        mockUser.clerkId,
      );

      expect(mockCommentsRepository.findOneBy).toHaveBeenCalledWith({
        id: mockComment.id,
      });
      expect(mockCommentsRepository.delete).toHaveBeenCalledWith(
        mockComment.id,
      );
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when the clerkId does not match any user', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(null);

      await expect(
        service.deleteComment(mockComment.id, 'clerk_unknown'),
      ).rejects.toThrow(NotFoundException);

      expect(mockCommentsRepository.findOneBy).not.toHaveBeenCalled();
      expect(mockCommentsRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when no comment exists with the given id', async () => {
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockCommentsRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.deleteComment(999, mockUser.clerkId),
      ).rejects.toThrow(NotFoundException);

      expect(mockCommentsRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when the comment belongs to a different user', async () => {
      const otherUserComment: Comment = {
        ...mockComment,
        userId: 'other-user-uuid-9999',
      };
      mockUsersService.findByClerkId.mockResolvedValue(mockUser);
      mockCommentsRepository.findOneBy.mockResolvedValue(otherUserComment);

      await expect(
        service.deleteComment(otherUserComment.id, mockUser.clerkId),
      ).rejects.toThrow(ForbiddenException);

      expect(mockCommentsRepository.delete).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getCommentsByPost
  // ---------------------------------------------------------------------------
  describe('getCommentsByPost', () => {
    it('should return comments with user relation ordered by createdAt ASC', async () => {
      const secondComment: Comment = {
        ...mockComment,
        id: 2,
        content: 'A second comment',
        createdAt: new Date('2024-01-02'),
      };
      const comments = [mockComment, secondComment];
      mockCommentsRepository.find.mockResolvedValue(comments);

      const result = await service.getCommentsByPost(42);

      expect(mockCommentsRepository.find).toHaveBeenCalledWith({
        where: { postId: 42 },
        relations: ['user'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(comments);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array when the post has no comments', async () => {
      mockCommentsRepository.find.mockResolvedValue([]);

      const result = await service.getCommentsByPost(99);

      expect(mockCommentsRepository.find).toHaveBeenCalledWith({
        where: { postId: 99 },
        relations: ['user'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // countComments
  // ---------------------------------------------------------------------------
  describe('countComments', () => {
    it('should return the total number of comments for a post', async () => {
      mockCommentsRepository.count.mockResolvedValue(7);

      const result = await service.countComments(42);

      expect(mockCommentsRepository.count).toHaveBeenCalledWith({
        where: { postId: 42 },
      });
      expect(result).toBe(7);
    });

    it('should return 0 when the post has no comments', async () => {
      mockCommentsRepository.count.mockResolvedValue(0);

      const result = await service.countComments(42);

      expect(result).toBe(0);
    });
  });
});

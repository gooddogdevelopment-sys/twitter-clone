import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { Follower } from '../followers/entites/followers.entity';
import { Reposts } from '../repost/entities/reposts.entity';
import { UsersService } from '../users/users.service';
import { LikesService } from '../likes/likes.service';
import { RepostsService } from '../repost/reposts.service';
import { CommentsService } from '../comments/comments.service';

const mockPostsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findBy: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
};

const mockFollowersRepository = { find: jest.fn() };
const mockRepostsRepository = { find: jest.fn() };

const mockUsersService = {
  findByClerkId: jest.fn(),
  findById: jest.fn(),
};

const mockLikesService = {
  countLikes: jest.fn(),
  isLikedByCurrentUser: jest.fn(),
};

const mockRepostsService = {
  countReposts: jest.fn(),
  isRepostedByCurrentUser: jest.fn(),
};

const mockCommentsService = {
  countComments: jest.fn(),
};

describe('PostsResolver', () => {
  let resolver: PostsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsResolver,
        PostsService,
        { provide: getRepositoryToken(Post), useValue: mockPostsRepository },
        {
          provide: getRepositoryToken(Follower),
          useValue: mockFollowersRepository,
        },
        {
          provide: getRepositoryToken(Reposts),
          useValue: mockRepostsRepository,
        },
        { provide: UsersService, useValue: mockUsersService },
        { provide: LikesService, useValue: mockLikesService },
        { provide: RepostsService, useValue: mockRepostsService },
        { provide: CommentsService, useValue: mockCommentsService },
      ],
    }).compile();

    resolver = module.get<PostsResolver>(PostsResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

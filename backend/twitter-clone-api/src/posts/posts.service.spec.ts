import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { Follower } from '../followers/entites/followers.entity';
import { Reposts } from '../repost/entities/reposts.entity';
import { UsersService } from '../users/users.service';

const mockPostsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findBy: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
};

const mockFollowersRepository = {
  find: jest.fn(),
};

const mockRepostsRepository = {
  find: jest.fn(),
};

const mockUsersService = {
  findByClerkId: jest.fn(),
  findById: jest.fn(),
};

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

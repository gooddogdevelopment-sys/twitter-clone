import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

const mockUser: User = {
  id: 'test-uuid-1234',
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

const mockUsersRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // createFromClerk
  // ---------------------------------------------------------------------------
  describe('createFromClerk', () => {
    it('should successfully create and return a user from a valid Clerk ID', async () => {
      mockUsersRepository.create.mockReturnValue({ clerkId: mockUser.clerkId });
      mockUsersRepository.save.mockResolvedValue(mockUser);

      const result = await service.createFromClerk(
        mockUser.clerkId,
        mockUser.username,
      );

      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        clerkId: mockUser.clerkId,
        username: mockUser.username,
      });
      expect(mockUsersRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should propagate a repository error when an invalid clerkId causes a DB constraint violation', async () => {
      // NOTE: The service currently passes the value straight to the repo without
      // validation. Once the TODO in createFromClerk is resolved (add input
      // validation for empty/null clerkId), this test should be updated to assert
      // on the new descriptive error thrown by the service itself.
      mockUsersRepository.create.mockReturnValue({ clerkId: '' });
      mockUsersRepository.save.mockRejectedValue(
        new Error('violates not-null constraint'),
      );

      await expect(service.createFromClerk('', '')).rejects.toThrow(
        'violates not-null constraint',
      );
    });
  });

  // ---------------------------------------------------------------------------
  // findByClerkId
  // ---------------------------------------------------------------------------
  describe('findByClerkId', () => {
    it('should return the user when a matching Clerk ID exists', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByClerkId(mockUser.clerkId);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { clerkId: mockUser.clerkId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user matches the given Clerk ID', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByClerkId('clerk_nonexistent');

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_nonexistent' },
      });
      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // findById
  // ---------------------------------------------------------------------------
  describe('findById', () => {
    it('should return the user when a matching ID exists', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user matches the given ID', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent-uuid-0000');

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent-uuid-0000' },
      });
      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // findByUsername
  // ---------------------------------------------------------------------------
  describe('findByUsername', () => {
    it('should return the user when a matching username exists', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername(mockUser.username);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { username: mockUser.username },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user matches the given username', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('ghost_user');

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'ghost_user' },
      });
      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // searchByUsername
  // ---------------------------------------------------------------------------
  describe('searchByUsername', () => {
    it('should return matching users for a valid search query', async () => {
      const secondUser: User = {
        ...mockUser,
        id: 'other-uuid-5678',
        username: 'testuser2',
      };
      const matchingUsers = [mockUser, secondUser];
      mockUsersRepository.find.mockResolvedValue(matchingUsers);

      const result = await service.searchByUsername('test');

      expect(mockUsersRepository.find).toHaveBeenCalledWith({
        where: { username: ILike('%test%') },
        take: 20,
      });
      expect(result).toEqual(matchingUsers);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array when no users match the search query', async () => {
      mockUsersRepository.find.mockResolvedValue([]);

      const result = await service.searchByUsername('zzznomatch');

      expect(mockUsersRepository.find).toHaveBeenCalledWith({
        where: { username: ILike('%zzznomatch%') },
        take: 20,
      });
      expect(result).toEqual([]);
    });

    it('should short-circuit and return an empty array without querying the DB when the query is blank', async () => {
      const result = await service.searchByUsername('   ');

      expect(mockUsersRepository.find).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createFromClerk(clerkId: string): Promise<User> {
    this.logger.log(`Creating user for Clerk ID: ${clerkId}`);
    const user = this.usersRepository.create({ clerkId });
    return this.usersRepository.save(user);
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { clerkId } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}

import { ObjectType, Field, Int, GraphQLISODateTime } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Likes } from '../../likes/entities/likes.entity';

@ObjectType()
@Entity()
export class Post {
  @Field(() => Int, { description: 'Post Id' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text')
  content: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Likes, (like) => like.user)
  likes: Likes[];

  @Field(() => Int)
  likesCount: number;

  @Field()
  @Column()
  userId: string;
}

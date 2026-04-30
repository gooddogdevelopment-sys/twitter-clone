import { ObjectType, Field, Int, GraphQLISODateTime } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Likes } from '../../likes/entities/likes.entity';
import { Reposts } from '../../repost/entities/reposts.entity';

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
  isLikedByCurrentUser: boolean;

  @Field()
  @Column()
  @Index()
  userId: string;

  @OneToMany(() => Reposts, (repost) => repost.post)
  reposts: Reposts[];

  @Field(() => String, { nullable: true })
  repostedByUsername?: string;

  @Field(() => Int, { nullable: true })
  repostsCount: number;

  @Field({ nullable: true })
  isRepostedByCurrentUser: boolean;
}

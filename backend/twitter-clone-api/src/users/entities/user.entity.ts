import { ObjectType, Field } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Follower } from '../../followers/entites/followers.entity';

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', nullable: false, unique: true })
  clerkId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @Field(() => [Follower], { nullable: true })
  @OneToMany(() => Follower, (follower) => follower.user)
  followers: Follower[]; // users who follow this user

  @Field(() => [Follower], { nullable: true })
  @OneToMany(() => Follower, (follower) => follower.follower)
  following: Follower[]; // users this user follows
}

import { graphql } from '../gql';
import { gql } from '@apollo/client';

// Plain gql versions used by the profile page (no codegen required)
export const IS_FOLLOWING = gql`
  query IsFollowing($userId: String!) {
    isFollowing(userId: $userId)
  }
`;

export const FOLLOW_USER = gql`
  mutation FollowUser($userIdToFollow: String!) {
    follow(createFollowerInput: { userIdToFollow: $userIdToFollow }) {
      id
      userId
      followerUserId
    }
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userIdToUnfollow: String!) {
    unfollow(userIdToUnfollow: $userIdToUnfollow)
  }
`;

export const GET_FOLLOWERS = graphql(`
  query GetFollowers($userId: String!) {
    followers(userId: $userId) {
      id
      userId
      followerUserId
      createdAt
    }
  }
`);

export const GET_FOLLOWING = graphql(`
  query GetFollowing($userId: String!) {
    following(userId: $userId) {
      id
      userId
      followerUserId
      createdAt
    }
  }
`);

export const FOLLOW = graphql(`
  mutation Follow($createFollowerInput: CreateFollowerInput!) {
    follow(createFollowerInput: $createFollowerInput) {
      id
      userId
      followerUserId
    }
  }
`);

export const UNFOLLOW = graphql(`
  mutation Unfollow($userIdToUnfollow: String!) {
    unfollow(userIdToUnfollow: $userIdToUnfollow)
  }
`);

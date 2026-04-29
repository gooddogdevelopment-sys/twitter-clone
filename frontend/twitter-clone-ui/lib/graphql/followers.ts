import { graphql } from '../gql';

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

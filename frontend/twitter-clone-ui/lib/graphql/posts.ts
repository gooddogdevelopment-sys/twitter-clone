import { graphql } from '../gql';
import { gql } from '@apollo/client';

export const GET_POSTS_BY_USER = gql`
  query GetPostsByUser($userId: String!) {
    postsByUser(userId: $userId) {
      id
      content
      createdAt
      likesCount
      isLikedByCurrentUser
    }
  }
`;

export const GET_FEED = gql`
  query GetFeed {
    feed {
      id
      content
      createdAt
      likesCount
      isLikedByCurrentUser
      repostsCount
      isRepostedByCurrentUser
      repostedByUsername
      user {
        id
        username
      }
    }
  }
`;

export const GET_POSTS = graphql(`
  query GetPosts {
    posts {
      id
      content
      userId
      createdAt
    }
  }
`);

export const CREATE_POST = graphql(`
  mutation CreatePost($createPostInput: CreatePostInput!) {
    createPost(createPostInput: $createPostInput) {
      id
      content
      userId
      createdAt
    }
  }
`);

export const UPDATE_POST = graphql(`
  mutation UpdatePost($updatePostInput: UpdatePostInput!) {
    updatePost(updatePostInput: $updatePostInput) {
      id
      content
      userId
    }
  }
`);

export const REMOVE_POST = graphql(`
  mutation RemovePost($id: Int!) {
    removePost(id: $id) {
      id
    }
  }
`);

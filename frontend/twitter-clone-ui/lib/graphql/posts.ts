import { graphql } from '../gql';

export const GET_POSTS = graphql(`
  query GetPosts {
    posts {
      id
      content
      userId
    }
  }
`);

export const CREATE_POST = graphql(`
  mutation CreatePost($createPostInput: CreatePostInput!) {
    createPost(createPostInput: $createPostInput) {
      id
      content
      userId
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

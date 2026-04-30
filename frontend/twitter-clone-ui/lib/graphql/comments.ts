import { gql } from '@apollo/client';

export const GET_COMMENTS_BY_POST = gql`
  query CommentsByPost($postId: Int!) {
    commentsByPost(postId: $postId) {
      id
      content
      createdAt
      userId
      user {
        id
        username
      }
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($postId: Int!, $content: String!) {
    createComment(postId: $postId, content: $content) {
      id
      content
      createdAt
      userId
      user {
        id
        username
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: Int!) {
    deleteComment(id: $id)
  }
`;

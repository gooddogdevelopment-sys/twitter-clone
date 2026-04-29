import { gql } from '@apollo/client';

export const LIKE_POST = gql`
  mutation LikePost($postId: Int!) {
    likePost(postId: $postId) {
      id
      postId
      userId
      isActive
    }
  }
`;

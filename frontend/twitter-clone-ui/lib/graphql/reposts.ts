import { gql } from '@apollo/client';

export const REPOST = gql`
  mutation Repost($postId: Int!) {
    repost(postId: $postId) {
      id
      postId
      userId
      isActive
    }
  }
`;
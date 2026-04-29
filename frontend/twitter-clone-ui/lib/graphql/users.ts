import { gql } from '@apollo/client';

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      username
    }
  }
`;

export const GET_USER_BY_USERNAME = gql`
  query GetUserByUsername($username: String!) {
    getUserByUsername(username: $username) {
      id
      username
    }
  }
`;

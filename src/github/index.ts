import { OctoClient } from './octo.js';
import { GraphQLClient } from './gql.js';

/**
 * Factory function to create both clients with the same token
 */
export function createGitHubClients(token?: string) {
  return {
    rest: new OctoClient(token),
    graphql: new GraphQLClient(token),
  };
}

export { OctoClient, GraphQLClient };
import { graphql } from '@octokit/graphql';
import Bottleneck from 'bottleneck';

/**
 * GraphQL client with rate limiting using Bottleneck
 */
export class GraphQLClient {
  private graphqlWithAuth: typeof graphql;
  private limiter: Bottleneck;

  constructor(token?: string) {
    // Create Bottleneck rate limiter
    // GraphQL has different rate limits - 5000 points/hour with varying point costs
    // We use a more conservative approach for GraphQL
    this.limiter = new Bottleneck({
      minTime: 1000, // Minimum time between requests (1 second to be safe)
      maxConcurrent: 1, // Maximum concurrent requests
      reservoir: 1000, // Initial token count (conservative)
      reservoirRefreshAmount: 1000, // Refill amount
      reservoirRefreshInterval: 60 * 60 * 1000, // Refill interval (1 hour)
      retryCount: 3, // Number of retries
      timeout: 30000, // Request timeout (30 seconds)
    });

    // Configure retry strategy with exponential backoff
    this.limiter.on('retry', (_error, jobInfo) => {
      console.log(`🔄 Retrying GraphQL request (attempt ${jobInfo.retryCount + 1})`);
    });

    this.limiter.on('failed', async (error, jobInfo) => {
      // Handle rate limit errors specifically
      if (error.status === 429 || (error.response && error.response.status === 429)) {
        const retryAfter = error.response?.headers['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default 1 minute
        console.log(`⏳ GraphQL rate limit exceeded, waiting ${waitTime / 1000}s before retry`);
        return waitTime;
      }

      // Handle GraphQL-specific errors
      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        console.log(`❌ GraphQL error: ${errorMessage}`);
        
        // Some GraphQL errors shouldn't be retried
        if (errorMessage.includes('rate limit') || errorMessage.includes('secondary rate limit')) {
          console.log(`⏳ Secondary rate limit hit, waiting ${60000 / 1000}s before retry`);
          return 60000; // Wait 1 minute
        }
      }
      
      // Exponential backoff for other errors
      if (jobInfo.retryCount < 2) {
        const delay = Math.min(1000 * Math.pow(2, jobInfo.retryCount), 30000);
        console.log(`⏳ GraphQL request failed, retrying in ${delay / 1000}s`);
        return delay;
      }
      
      return; // Don't retry after max attempts
    });

    // Create GraphQL client with auth
    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: token ? `token ${token}` : '',
      },
    });
  }

  /**
   * Execute a GraphQL query with rate limiting
   */
  async query<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      return await this.limiter.schedule(() => 
        this.graphqlWithAuth(query, variables)
      );
    } catch (error: any) {
      console.warn('GraphQL query failed:', error.message);
      throw error;
    }
  }

  /**
   * Check if GitHub GraphQL API is available and accessible
   */
  async healthCheck(): Promise<{ available: boolean; error?: string }> {
    try {
      const query = `
        query {
          viewer {
            login
          }
        }
      `;
      
      await this.limiter.schedule(() => this.graphqlWithAuth(query));
      return { available: true };
    } catch (error: any) {
      console.warn('GraphQL API health check failed:', error.message);
      return { 
        available: false, 
        error: error.message || 'Unknown error' 
      };
    }
  }

  /**
   * Get current rate limit information via GraphQL
   */
  async getRateLimit(): Promise<any> {
    try {
      const query = `
        query {
          rateLimit {
            limit
            cost
            remaining
            resetAt
          }
        }
      `;
      
      const response = await this.limiter.schedule(() => 
        this.graphqlWithAuth(query)
      ) as { rateLimit: any };
      return response.rateLimit;
    } catch (error: any) {
      console.warn('Failed to get GraphQL rate limit info:', error.message);
      throw error;
    }
  }

  /**
   * Get authenticated user via GraphQL (useful for testing)
   */
  async getViewer(): Promise<any> {
    try {
      const query = `
        query {
          viewer {
            login
            name
            email
          }
        }
      `;
      
      const response = await this.limiter.schedule(() => 
        this.graphqlWithAuth(query)
      ) as { viewer: any };
      return response.viewer;
    } catch (error: any) {
      console.warn('Failed to get viewer info:', error.message);
      throw error;
    }
  }

  /**
   * Graceful shutdown - wait for pending requests to complete
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down GraphQL client...');
    return this.limiter.stop();
  }
}
import { Octokit } from '@octokit/rest';
import Bottleneck from 'bottleneck';

/**
 * Enhanced REST client with rate limiting using Bottleneck
 */
export class OctoClient {
  private octokit: Octokit;
  private limiter: Bottleneck;

  constructor(token?: string) {
    // Create Bottleneck rate limiter
    // GitHub API limits: 5000 requests/hour for authenticated users
    // That's about 1.4 requests per second, so we use minTime of 750ms to be safe
    this.limiter = new Bottleneck({
      minTime: 750, // Minimum time between requests in milliseconds
      maxConcurrent: 1, // Maximum concurrent requests
      reservoir: 5000, // Initial token count (GitHub's hourly limit)
      reservoirRefreshAmount: 5000, // Refill amount
      reservoirRefreshInterval: 60 * 60 * 1000, // Refill interval (1 hour)
      retryCount: 3, // Number of retries
      timeout: 30000, // Request timeout (30 seconds)
    });

    // Configure retry strategy with exponential backoff
    this.limiter.on('retry', (_error, jobInfo) => {
      console.log(`🔄 Retrying GitHub API request (attempt ${jobInfo.retryCount + 1})`);
    });

    this.limiter.on('failed', async (error, jobInfo) => {
      // Handle rate limit errors specifically
      if (error.status === 429 || (error.response && error.response.status === 429)) {
        const retryAfter = error.response?.headers['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default 1 minute
        console.log(`⏳ Rate limit exceeded, waiting ${waitTime / 1000}s before retry`);
        return waitTime;
      }
      
      // Exponential backoff for other errors (network, server errors)
      if (jobInfo.retryCount < 2) {
        const delay = Math.min(1000 * Math.pow(2, jobInfo.retryCount), 30000);
        console.log(`⏳ Request failed, retrying in ${delay / 1000}s`);
        return delay;
      }
      
      return; // Don't retry after max attempts
    });

    // Create Octokit instance
    this.octokit = new Octokit({
      auth: token,
      request: {
        // Wrap all requests with rate limiter
        hook: (url: string, options: any) => {
          return this.limiter.schedule(() => this.octokit.request(url, options));
        },
      },
    });
  }

  /**
   * Get the underlying Octokit instance (with rate limiting applied)
   */
  get rest(): Octokit {
    return this.octokit;
  }

  /**
   * Check if GitHub API is available and accessible
   */
  async healthCheck(): Promise<{ available: boolean; error?: string }> {
    try {
      await this.limiter.schedule(() => this.octokit.rest.meta.get());
      return { available: true };
    } catch (error: any) {
      console.warn('GitHub API health check failed:', error.message);
      return { 
        available: false, 
        error: error.message || 'Unknown error' 
      };
    }
  }

  /**
   * Get current rate limit information
   */
  async getRateLimit(): Promise<any> {
    try {
      const response = await this.limiter.schedule(() => 
        this.octokit.rest.rateLimit.get()
      );
      return response.data;
    } catch (error: any) {
      console.warn('Failed to get rate limit info:', error.message);
      throw error;
    }
  }

  /**
   * Get authenticated user (useful for testing)
   */
  async getUser(): Promise<any> {
    try {
      const response = await this.limiter.schedule(() => 
        this.octokit.rest.users.getAuthenticated()
      );
      return response.data;
    } catch (error: any) {
      console.warn('Failed to get authenticated user:', error.message);
      throw error;
    }
  }

  /**
   * Graceful shutdown - wait for pending requests to complete
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down GitHub REST client...');
    return this.limiter.stop();
  }
}
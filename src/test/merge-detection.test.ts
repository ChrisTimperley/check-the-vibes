import { describe, it, expect } from 'vitest';

// Mock commit data structure to test merge detection logic
interface MockCommit {
  sha: string;
  parents: { sha: string }[];
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  author?: { login: string };
}

// Function that mimics the merge detection logic from GitHub service
function isMergeCommit(commit: MockCommit): boolean {
  return !!(commit.parents && commit.parents.length > 1);
}

describe('Merge commit detection', () => {
  it('should identify merge commits correctly', () => {
    const mergeCommit: MockCommit = {
      sha: 'abc123',
      parents: [
        { sha: 'parent1' },
        { sha: 'parent2' }
      ],
      commit: {
        message: 'Merge pull request #1 from feature/branch',
        author: { name: 'Developer', date: '2025-01-01T00:00:00Z' }
      },
      author: { login: 'developer' }
    };

    expect(isMergeCommit(mergeCommit)).toBe(true);
  });

  it('should identify regular commits correctly', () => {
    const regularCommit: MockCommit = {
      sha: 'def456',
      parents: [
        { sha: 'parent1' }
      ],
      commit: {
        message: 'Fix bug in authentication',
        author: { name: 'Developer', date: '2025-01-01T00:00:00Z' }
      },
      author: { login: 'developer' }
    };

    expect(isMergeCommit(regularCommit)).toBe(false);
  });

  it('should handle commits with no parents', () => {
    const initialCommit: MockCommit = {
      sha: 'ghi789',
      parents: [],
      commit: {
        message: 'Initial commit',
        author: { name: 'Developer', date: '2025-01-01T00:00:00Z' }
      },
      author: { login: 'developer' }
    };

    expect(isMergeCommit(initialCommit)).toBe(false);
  });

  it('should handle null or undefined parents', () => {
    const commitWithNoParents: MockCommit = {
      sha: 'jkl012',
      parents: null as any,
      commit: {
        message: 'Some commit',
        author: { name: 'Developer', date: '2025-01-01T00:00:00Z' }
      },
      author: { login: 'developer' }
    };

    expect(isMergeCommit(commitWithNoParents)).toBe(false);
  });
});
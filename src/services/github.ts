import { Octokit } from '@octokit/rest';
import type { PullRequest } from '../types/index.js';
import type { Commit } from '../types/index.js';

export class GitHubService {
  private octokit: Octokit;
  private readonly abortController: AbortController;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token,
    });
    this.abortController = new AbortController();
  }

  /**
   * Cancel all ongoing operations
   */
  cancel(): void {
    this.abortController.abort();
  }

  async getPullRequestsSince(
    owner: string,
    repo: string,
    since: Date,
    until?: Date
  ): Promise<PullRequest[]> {
    const pullRequests: PullRequest[] = [];
    let page = 1;
    const perPage = 100;
    let totalProcessed = 0;

    console.log(`🔍 Fetching pull requests from ${owner}/${repo}...`);

    let hasMore = true;
    while (hasMore) {
      console.log(
        `📄 Fetching page ${page} (up to ${perPage} PRs per page)...`
      );

      const response = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'all',
        sort: 'created',
        direction: 'desc',
        per_page: perPage,
        page,
      });

      if (response.data.length === 0) {
        console.log('📄 No more pull requests found');
        hasMore = false;
        break;
      }

      console.log(
        `📋 Processing ${response.data.length} pull requests from page ${page}...`
      );

      for (const pr of response.data) {
        const createdAt = new Date(pr.created_at);

        // Stop if we've gone past our date range
        if (createdAt < since) {
          console.log(
            `⏹️  Reached PRs older than ${since.toISOString().split('T')[0]}, stopping scan`
          );
          return pullRequests;
        }

        // Skip if it's after our until date (if specified)
        if (until && createdAt > until) {
          continue;
        }

        totalProcessed++;
        console.log(
          `🔄 Analyzing PR #${pr.number}: "${pr.title}" (${totalProcessed} processed so far)`
        );

        const analysis = await this.analyzePullRequest(owner, repo, pr.number);
        pullRequests.push(analysis);
      }

      // If we got fewer results than requested, we're on the last page
      if (response.data.length < perPage) {
        console.log(`📄 Reached final page (page ${page})`);
        hasMore = false;
        break;
      }

      console.log(`📄 Completed page ${page}, moving to next page...`);
      page++;
    }

    console.log(
      `🎉 Completed scanning! Found ${pullRequests.length} pull requests in date range`
    );
    return pullRequests;
  }

  async analyzePullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<PullRequest> {
    console.log(`  📊 Fetching detailed data for PR #${prNumber} (graphql)...`);
    const query = `
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $number) {
            number
            title
            author { login }
            createdAt
            mergedAt
            closedAt
            state
            additions
            deletions
            changedFiles
            commits { totalCount }
            lastCommit: commits(last: 1) {
              nodes {
                commit {
                  oid
                  checkSuites(first: 50) {
                    nodes {
                      checkRuns(first: 50) {
                        nodes {
                          name
                          conclusion
                          status
                        }
                      }
                    }
                  }
                }
              }
            }
            reviews(first: 100) {
              totalCount
              nodes {
                author { login }
              }
            }
            comments: comments(first: 1) { totalCount }
            closingIssuesReferences(first: 1) {
              nodes { number }
            }
            url: url
          }
        }
      }
    `;

    const result: any = await this.octokit.graphql(query, {
      owner,
      repo,
      number: prNumber,
    });

    console.log(`  ✅ Completed analysis for PR #${prNumber} (graphql)`);

    const pr = result.repository.pullRequest;
    const totalAdditions = pr.additions || 0;
    const totalDeletions = pr.deletions || 0;
    const linkedIssue = pr.closingIssuesReferences?.nodes?.[0]?.number || null;

    // FIXME this code is horrible! it needs to be cleaned up
    // Determine CI status from check runs returned for the head commit (if any)
    let ciStatus: 'success' | 'failure' | 'pending' | 'unknown' = 'unknown';
    try {
      const checkRunNodes: any[] = [];
      const commitNodes =
        pr.lastCommit && pr.lastCommit.nodes ? pr.lastCommit.nodes : [];
      if (commitNodes.length > 0 && commitNodes[0].commit) {
        const suites = commitNodes[0].commit.checkSuites?.nodes || [];
        for (const suite of suites) {
          const runs = suite.checkRuns?.nodes || [];
          for (const r of runs) checkRunNodes.push(r);
        }
      }

      if (checkRunNodes.length > 0) {
        const hasFailure = checkRunNodes.some(
          (run) =>
            (run.conclusion || '').toString().toLowerCase() === 'failure' ||
            (run.conclusion || '').toString().toLowerCase() === 'cancelled'
        );
        const hasSuccess = checkRunNodes.some(
          (run) => (run.conclusion || '').toString().toLowerCase() === 'success'
        );
        const hasPending = checkRunNodes.some((run) => {
          const s = (run.status || '').toString().toLowerCase();
          return (
            s === 'in_progress' ||
            s === 'queued' ||
            (run.conclusion || '').toString().toLowerCase() === 'neutral' ||
            s === 'waiting'
          );
        });

        if (hasPending) ciStatus = 'pending';
        else if (hasFailure) ciStatus = 'failure';
        else if (hasSuccess) ciStatus = 'success';
        else ciStatus = 'unknown';
      } else {
        ciStatus = 'unknown';
      }
    } catch (error) {
      console.warn(`Failed to determine CI status for PR ${prNumber}:`, error);
      ciStatus = 'unknown';
    }

    const status: 'Open' | 'Closed' | 'Merged' | 'Draft' = (() => {
      if (pr.mergedAt) return 'Merged';
      if (String(pr.state || '').toLowerCase() === 'closed') return 'Closed';
      return 'Open';
    })();

    return {
      number: pr.number,
      title: pr.title,
      author: pr.author?.login || 'unknown',
      created_at: pr.createdAt,
      merged_at: pr.mergedAt || undefined,
      closed_at: pr.closedAt || undefined,
      status,
      linked_issues: linkedIssue ? [linkedIssue] : [],
      additions: totalAdditions,
      deletions: totalDeletions,
      reviewers: Array.from(
        new Set(
          ((pr.reviews?.nodes || []) as any[])
            .map((r: any) => r.author?.login)
            .filter(Boolean) as string[]
        )
      ),
      ci_status: ciStatus,
      url: pr.url || pr.html_url,
      comments: pr.comments?.totalCount || 0,
    };
  }

  async validateRepository(owner: string, repo: string): Promise<boolean> {
    try {
      await this.octokit.repos.get({ owner, repo });
      return true;
    } catch (error) {
      const enhancedError = new Error(
        `Failed to validate repository ${owner}/${repo}`,
        {
          cause: error,
        }
      );
      console.warn(enhancedError.message, { cause: enhancedError.cause });
      return false;
    }
  }

  async getIssuesSince(
    owner: string,
    repo: string,
    since: Date,
    until?: Date
  ): Promise<any[]> {
    // Use GraphQL search to fetch issues and comment counts in bulk.
    const issues: any[] = [];
    const perPage = 50;
    let after: string | null = null;
    const sinceIso = since.toISOString().split('T')[0];
    const untilIso = until ? until.toISOString().split('T')[0] : null;

    console.log(`🔍 Fetching issues (graphql) from ${owner}/${repo}...`);

    const query = `
      query($queryString: String!, $first: Int!, $after: String) {
        search(query: $queryString, type: ISSUE, first: $first, after: $after) {
          issueCount
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              ... on Issue {
                number
                title
                author { login }
                createdAt
                closedAt
                state
                comments { totalCount }
                assignees(first: 50) { nodes { login } }
                labels(first: 50) { nodes { name } }
                url
              }
            }
          }
        }
      }
    `;

    // Build search qualifier string. Use created range and is:issue to exclude PRs.
    let searchQual = `repo:${owner}/${repo} is:issue created:>=${sinceIso}`;
    if (untilIso) searchQual += ` created:<=${untilIso}`;
    // Sort by created desc to help early termination
    searchQual += ' sort:created-desc';

    let hasNext = true;
    do {
      const result: any = await this.octokit.graphql(query, {
        queryString: searchQual,
        first: perPage,
        after,
      });

      const res = result.search;
      const edges = res.edges || [];
      for (const edge of edges) {
        const node = edge.node;
        // Map GraphQL Issue node to existing issue shape
        const created_at = node.createdAt;
        const closed_at = node.closedAt || null;

        // ignore if created before since (defensive)
        if (new Date(created_at) < since) {
          // we've reached older issues; stop processing
          return issues;
        }

        // If until provided and created after until, skip
        if (until && new Date(created_at) > until) continue;

        issues.push({
          number: node.number,
          title: node.title,
          author: node.author?.login || 'unknown',
          created_at,
          closed_at,
          is_closed: String(node.state || '').toLowerCase() === 'closed',
          time_to_first_response_minutes: null,
          time_to_close_hours: closed_at
            ? Math.round(
                (new Date(closed_at).getTime() -
                  new Date(created_at).getTime()) /
                  (1000 * 60 * 60)
              )
            : null,
          assignees: (node.assignees?.nodes || []).map((n: any) => n.login),
          labels: (node.labels?.nodes || [])
            .map((l: any) => l.name)
            .filter(Boolean),
          linked_prs: [],
          url: node.url,
          comments: node.comments?.totalCount || 0,
        });
      }

      hasNext = Boolean(res.pageInfo?.hasNextPage);
      after = res.pageInfo?.endCursor || null;
    } while (hasNext);

    console.log(`🎉 Found ${issues.length} issues in date range (graphql)`);
    return issues;
  }

  /**
   * Fetch all commits for the default branch within a date range
   */
  async fetchCommitsForDefaultBranch(
    owner: string,
    repo: string,
    since: Date,
    until?: Date
  ): Promise<Commit[]> {
    const commits: Commit[] = [];
    const perPage = 100;
    let after: string | null = null;

    console.log(
      `🔍 Fetching commits for default branch of ${owner}/${repo} (graphql)...`
    );

    const query = `
      query($owner: String!, $repo: String!, $perPage: Int!, $after: String, $since: GitTimestamp, $until: GitTimestamp) {
        repository(owner: $owner, name: $repo) {
          defaultBranchRef {
            name
            target {
              ... on Commit {
                history(first: $perPage, after: $after, since: $since, until: $until) {
                  pageInfo { hasNextPage endCursor }
                  nodes {
                    oid
                    message
                    committedDate
                    additions
                    deletions
                    author { user { login } name }
                    associatedPullRequests(first: 1) {
                      nodes {
                        number
                        merged
                      }
                    }
                    checkSuites(first: 50) {
                      nodes {
                        checkRuns(first: 50) {
                          nodes {
                            name
                            conclusion
                            status
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const sinceIso = since.toISOString();
    const untilIso = until ? until.toISOString() : undefined;

    let hasNext = true;
    do {
      const result: any = await this.octokit.graphql(query, {
        owner,
        repo,
        perPage,
        after,
        since: sinceIso,
        until: untilIso,
      });

      const history = result.repository?.defaultBranchRef?.target?.history;
      if (!history) break;

      const nodes = history.nodes || [];
      console.log(`📋 Processing ${nodes.length} commits from history page...`);

      for (const node of nodes) {
        const sha = node.oid;
        const additions = node.additions || 0;
        const deletions = node.deletions || 0;
        const message = node.message || '';
        const date = node.committedDate || new Date().toISOString();
        const committer =
          node.author?.user?.login || node.author?.name || 'unknown';

        // Determine CI status from check runs in the commit's check suites
        let ciStatus: 'pass' | 'fail' | 'pending' | 'unknown' | 'none' =
          'unknown';
        try {
          const checkRunNodes: any[] = [];
          const suites = node.checkSuites?.nodes || [];
          for (const suite of suites) {
            const runs = suite.checkRuns?.nodes || [];
            for (const r of runs) checkRunNodes.push(r);
          }

          if (checkRunNodes.length > 0) {
            const hasFailure = checkRunNodes.some(
              (run) =>
                (run.conclusion || '').toString().toLowerCase() === 'failure' ||
                (run.conclusion || '').toString().toLowerCase() === 'cancelled'
            );
            const hasSuccess = checkRunNodes.some(
              (run) =>
                (run.conclusion || '').toString().toLowerCase() === 'success'
            );
            const hasPending = checkRunNodes.some((run) => {
              const s = (run.status || '').toString().toLowerCase();
              return (
                s === 'in_progress' ||
                s === 'queued' ||
                s === 'waiting' ||
                (run.conclusion || '').toString().toLowerCase() === 'neutral'
              );
            });

            if (hasPending) ciStatus = 'pending';
            else if (hasFailure) ciStatus = 'fail';
            else if (hasSuccess) ciStatus = 'pass';
            else ciStatus = 'unknown';
          } else {
            ciStatus = 'none';
          }
        } catch (error) {
          console.warn(
            `Failed to compute CI status for commit ${sha.slice(0, 7)}:`,
            error
          );
          ciStatus = 'unknown';
        }

        // Find associated PR (if any)
        const associatedPR = node.associatedPullRequests?.nodes?.[0];
        const prNumber = associatedPR?.merged ? associatedPR.number : null;

        commits.push({
          sha,
          committer,
          message,
          date,
          additions,
          deletions,
          pr: prNumber,
          ci_status: ciStatus,
        });
      }

      hasNext = Boolean(history.pageInfo?.hasNextPage);
      after = history.pageInfo?.endCursor || null;
    } while (hasNext);

    console.log(
      `🎉 Completed fetching! Found ${commits.length} commits in date range`
    );
    return commits;
  }

  /**
   * Get commit counts for all contributors across ALL branches within a date range.
   * Uses GraphQL to query all refs (branches) and aggregate unique commits.
   * Returns a map of login -> commit count.
   */
  async getCommitCountsAcrossBranches(
    owner: string,
    repo: string,
    since: Date,
    until?: Date
  ): Promise<Map<string, number>> {
    console.log(
      `🔍 Fetching commit counts across all branches for ${owner}/${repo}...`
    );

    const commitCounts = new Map<string, number>();
    const seenShas = new Set<string>(); // Track unique commits across all branches

    // Step 1: Get all refs (branches and tags)
    console.log(`  📋 Fetching repository refs...`);
    const refs = await this.getRepositoryRefs(owner, repo);
    console.log(`  ✅ Found ${refs.length} refs to query`);

    // Step 2: For each ref, query commit history
    const sinceIso = since.toISOString();
    const untilIso = until?.toISOString();

    for (const ref of refs) {
      console.log(`  � Querying commits for ref: ${ref.name}`);

      const query = `
        query($owner: String!, $repo: String!, $refName: String!, $since: GitTimestamp, $until: GitTimestamp) {
          repository(owner: $owner, name: $repo) {
            ref(qualifiedName: $refName) {
              target {
                ... on Commit {
                  history(first: 100, since: $since, until: $until) {
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                    nodes {
                      oid
                      author {
                        name
                        email
                        user {
                          login
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      try {
        const result: any = await this.octokit.graphql(query, {
          owner,
          repo,
          refName: ref.name,
          since: sinceIso,
          until: untilIso,
        });

        const history = result.repository?.ref?.target?.history;
        if (!history) continue;

        const nodes = history.nodes || [];
        console.log(`    ✅ Found ${nodes.length} commits on ${ref.name}`);

        for (const node of nodes) {
          const sha = node.oid;

          // Skip if we've already counted this commit
          if (seenShas.has(sha)) continue;
          seenShas.add(sha);

          // Get author login
          const login =
            node.author?.user?.login || node.author?.name || 'unknown';

          // Skip bots
          if (login.endsWith('[bot]')) continue;

          commitCounts.set(login, (commitCounts.get(login) || 0) + 1);
        }

        // TODO: Handle pagination if needed (hasNextPage)
        // For now, we're limiting to 100 commits per branch
      } catch (error: any) {
        console.warn(
          `  ⚠️  Failed to query ref ${ref.name}:`,
          error?.message || error
        );
      }
    }

    console.log(
      `🎉 Found ${commitCounts.size} contributors with ${seenShas.size} unique commits across all branches`
    );
    return commitCounts;
  }

  /**
   * Get all refs (branches) for a repository
   */
  private async getRepositoryRefs(
    owner: string,
    repo: string
  ): Promise<Array<{ name: string; type: 'branch' | 'tag' }>> {
    const refs: Array<{ name: string; type: 'branch' | 'tag' }> = [];

    const query = `
      query($owner: String!, $repo: String!, $after: String) {
        repository(owner: $owner, name: $repo) {
          refs(first: 100, refPrefix: "refs/heads/", after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              name
            }
          }
        }
      }
    `;

    let hasNext = true;
    let after: string | null = null;

    try {
      while (hasNext) {
        const result: any = await this.octokit.graphql(query, {
          owner,
          repo,
          after,
        });

        const refsData = result.repository?.refs;
        if (!refsData) break;

        const nodes = refsData.nodes || [];
        for (const node of nodes) {
          refs.push({
            name: `refs/heads/${node.name}`,
            type: 'branch',
          });
        }

        hasNext = refsData.pageInfo?.hasNextPage || false;
        after = refsData.pageInfo?.endCursor || null;
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch refs:', error?.message || error);
    }

    return refs;
  }
}

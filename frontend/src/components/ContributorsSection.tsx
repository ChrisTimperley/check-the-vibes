import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Link,
} from '@mui/material';
import { Contributor, PullRequest, Issue } from '../types';

interface ContributorsSectionProps {
  contributors: Contributor[];
  pullRequests?: PullRequest[];
  issues?: Issue[];
}

export const ContributorsSection: React.FC<ContributorsSectionProps> = ({
  contributors,
  pullRequests = [],
  issues = [],
}) => {
  // Calculate detailed metrics for each contributor
  const getContributorMetrics = (contributorLogin: string) => {
    // PR metrics
    const createdPRs = pullRequests.filter(
      (pr) => pr.author === contributorLogin
    );
    const reviewedPRs = pullRequests.filter((pr) =>
      pr.reviewers.includes(contributorLogin)
    );
    const closedPRs = createdPRs.filter(
      (pr) => pr.status === 'Closed' || pr.status === 'Merged'
    );
    const prComments = createdPRs.reduce(
      (sum, pr) => sum + (pr.comments || 0),
      0
    );

    // Issue metrics
    const createdIssues = issues.filter(
      (issue) => issue.author === contributorLogin
    );
    const assignedIssues = issues.filter((issue) =>
      issue.assignees.includes(contributorLogin)
    );
    const closedIssues = createdIssues.filter((issue) => issue.is_closed);
    const issueComments = createdIssues.reduce(
      (sum, issue) => sum + (issue.comments || 0),
      0
    );

    return {
      prs: {
        created: createdPRs.length,
        reviewed: reviewedPRs.length,
        closed: closedPRs.length,
        comments: prComments,
      },
      issues: {
        created: createdIssues.length,
        assigned: assignedIssues.length,
        closed: closedIssues.length,
        comments: issueComments,
      },
    };
  };
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Contributors
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {contributors.length} active contributors in this period
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {contributors.map((contributor) => {
            const metrics = getContributorMetrics(contributor.login);

            return (
              <Card
                key={contributor.login}
                variant="outlined"
                sx={{ minWidth: 320, flexGrow: 1 }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={
                        contributor.avatar_url ||
                        `https://avatars.githubusercontent.com/${contributor.login}`
                      }
                      alt={contributor.login}
                      sx={{ width: 40, height: 40, mr: 1 }}
                    >
                      {contributor.login
                        ? contributor.login[0].toUpperCase()
                        : ''}
                    </Avatar>
                    <Typography variant="h6" component="div">
                      <Link
                        href={`https://github.com/${contributor.login}`}
                        target="_blank"
                        rel="noreferrer"
                        color="inherit"
                        underline="hover"
                        sx={{ textDecoration: 'none' }}
                      >
                        {contributor.login}
                      </Link>
                    </Typography>
                  </Box>

                  {/* Commits Section */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Commits
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`Total: ${contributor.commits}`}
                        size="small"
                        color="primary"
                      />
                      {contributor.direct_pushes_default > 0 && (
                        <Chip
                          label={`Direct pushes: ${contributor.direct_pushes_default}`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>

                  {/* PRs Section */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="secondary"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Pull Requests
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`Created: ${metrics.prs.created}`}
                        size="small"
                        color="secondary"
                      />
                      <Chip
                        label={`Reviewed: ${metrics.prs.reviewed}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Closed: ${metrics.prs.closed}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      {metrics.prs.comments > 0 && (
                        <Chip
                          label={`Comments: ${metrics.prs.comments}`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Issues Section */}
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="subtitle2"
                      color="warning.main"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Issues
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`Created: ${metrics.issues.created}`}
                        size="small"
                        color="warning"
                      />
                      <Chip
                        label={`Assigned: ${metrics.issues.assigned}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                      <Chip
                        label={`Closed: ${metrics.issues.closed}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      {metrics.issues.comments > 0 && (
                        <Chip
                          label={`Comments: ${metrics.issues.comments}`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

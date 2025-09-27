import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link,
  Chip,
} from '@mui/material';
import { Settings } from '@mui/icons-material';
import { PullRequest, Issue } from '../types';

interface PullRequestsSectionProps {
  pullRequests: PullRequest[];
  issues: Issue[];
  owner: string;
  repo: string;
}

export const PullRequestsSection: React.FC<PullRequestsSectionProps> = ({
  pullRequests,
  issues,
  owner,
  repo,
}) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <div>
            <Typography variant="h5" component="h2" gutterBottom>
              Pull Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pullRequests.length} pull requests in this period
            </Typography>
          </div>
          <Button variant="outlined" startIcon={<Settings />}>
            Filter
          </Button>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>PR #</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Reviewer</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Comments</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Linked Issue</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>CI</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Lines Changed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pullRequests.map((pr) => {
              // Use comments directly from PR data, or fallback to deriving from linked issues
              let comments = pr.comments ?? 0;
              let linkedIssueElement = <span>—</span>;

              if (pr.linked_issues && pr.linked_issues.length > 0) {
                // If we don't have comments from PR data, try to get from first linked issue
                if (pr.comments === undefined) {
                  const issue = issues.find(
                    (i) => i.number === pr.linked_issues[0]
                  );
                  comments = issue?.comments ?? 0;
                }

                // Handle multiple linked issues
                if (pr.linked_issues.length === 1) {
                  const issueNum = pr.linked_issues[0];
                  const issueUrl = `https://github.com/${owner}/${repo}/issues/${issueNum}`;
                  linkedIssueElement = (
                    <Link href={issueUrl} target="_blank" rel="noreferrer">
                      #{issueNum}
                    </Link>
                  );
                } else {
                  // Multiple issues - show them as separate links
                  linkedIssueElement = (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {pr.linked_issues.map((issueNum, index) => (
                        <span key={issueNum}>
                          <Link
                            href={`https://github.com/${owner}/${repo}/issues/${issueNum}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            #{issueNum}
                          </Link>
                          {index < pr.linked_issues.length - 1 && ', '}
                        </span>
                      ))}
                    </Box>
                  );
                }
              }

              // Handle multiple reviewers
              const renderReviewers = () => {
                if (!pr.reviewers || pr.reviewers.length === 0) {
                  return <span>—</span>;
                }

                if (pr.reviewers.length === 1) {
                  return (
                    <Link
                      href={`https://github.com/${pr.reviewers[0]}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {pr.reviewers[0]}
                    </Link>
                  );
                }

                // Multiple reviewers - show them as separate links
                return (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {pr.reviewers.map((reviewer, index) => (
                      <span key={reviewer}>
                        <Link
                          href={`https://github.com/${reviewer}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {reviewer}
                        </Link>
                        {index < pr.reviewers.length - 1 && ', '}
                      </span>
                    ))}
                  </Box>
                );
              };

              // Helper function to get status chip properties
              const getStatusChip = (status: string) => {
                switch (status.toLowerCase()) {
                  case 'merged':
                    return { label: 'Merged', color: 'success' as const };
                  case 'closed':
                    return { label: 'Closed', color: 'error' as const };
                  case 'open':
                    return { label: 'Open', color: 'info' as const };
                  case 'draft':
                    return { label: 'Draft', color: 'default' as const };
                  default:
                    return { label: status, color: 'default' as const };
                }
              };

              const statusChip = getStatusChip(pr.status);

              return (
                <TableRow key={pr.number}>
                  <TableCell>
                    <Link href={pr.url} target="_blank" rel="noreferrer">
                      #{pr.number}
                    </Link>
                  </TableCell>
                  <TableCell>{pr.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusChip.label}
                      size="small"
                      color={statusChip.color}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`https://github.com/${pr.author}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {pr.author}
                    </Link>
                  </TableCell>
                  <TableCell>{renderReviewers()}</TableCell>
                  <TableCell>{comments}</TableCell>
                  <TableCell>{linkedIssueElement}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        pr.ci_status === 'none' || pr.ci_status === 'unknown'
                          ? 'No CI'
                          : pr.ci_status === 'success'
                            ? 'pass'
                            : pr.ci_status === 'failure'
                              ? 'fail'
                              : pr.ci_status === 'pending'
                                ? 'pending'
                                : pr.ci_status
                      }
                      size="small"
                      color={
                        pr.ci_status === 'success'
                          ? 'success'
                          : pr.ci_status === 'failure'
                            ? 'error'
                            : pr.ci_status === 'pending'
                              ? 'warning'
                              : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Chip
                        label={`+${pr.additions ?? 0}`}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={`-${pr.deletions ?? 0}`}
                        size="small"
                        color="error"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

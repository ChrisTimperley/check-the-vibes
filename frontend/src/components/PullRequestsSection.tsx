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
}

export const PullRequestsSection: React.FC<PullRequestsSectionProps> = ({
  pullRequests,
  issues,
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
              let linkedIssueLabel = '—';

              if (pr.linked_issues && pr.linked_issues.length > 0) {
                const first = pr.linked_issues[0];
                linkedIssueLabel = `#${first}`;
                // If we don't have comments from PR data, try to get from issues
                if (pr.comments === undefined) {
                  const issue = issues.find((i) => i.number === first);
                  comments = issue?.comments ?? 0;
                }
              }

              const reviewerName =
                pr.reviewers && pr.reviewers.length > 0
                  ? pr.reviewers[0]
                  : null;

              return (
                <TableRow key={pr.number}>
                  <TableCell>
                    <Link href={pr.url} target="_blank" rel="noreferrer">
                      #{pr.number}
                    </Link>
                  </TableCell>
                  <TableCell>{pr.title}</TableCell>
                  <TableCell>
                    <Link
                      href={`https://github.com/${pr.author}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {pr.author}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {reviewerName ? (
                      <Link
                        href={`https://github.com/${reviewerName}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {reviewerName}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{comments}</TableCell>
                  <TableCell>{linkedIssueLabel}</TableCell>
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

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
              <TableCell sx={{ fontWeight: 700 }}>
                Linked Issue
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>CI</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                Lines Changed
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pullRequests.map((pr) => {
              // derive comments count from linked issues when available
              let comments = 0;
              let linkedIssueLabel = '—';
              if (pr.linked_issues && pr.linked_issues.length > 0) {
                const first = pr.linked_issues[0];
                const issue = issues.find(
                  (i) => i.number === first
                );
                comments = issue?.comments ?? 0;
                linkedIssueLabel = `#${first}`;
              }
              const reviewerName =
                pr.reviewers && pr.reviewers.length > 0
                  ? pr.reviewers[0]
                  : null;

              return (
                <TableRow key={pr.number}>
                  <TableCell>
                    <Link
                      href={pr.url}
                      target="_blank"
                      rel="noreferrer"
                    >
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
                        pr.ci_status === 'none'
                          ? 'No CI'
                          : pr.ci_status === 'pass'
                            ? 'pass'
                            : pr.ci_status === 'fail'
                              ? 'fail'
                              : pr.ci_status
                      }
                      size="small"
                      color={
                        pr.ci_status === 'pass'
                          ? 'success'
                          : pr.ci_status === 'fail'
                            ? 'error'
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
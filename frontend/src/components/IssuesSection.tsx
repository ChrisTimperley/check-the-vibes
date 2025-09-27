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
import { Issue, ProjectItem } from '../types';
import { formatDate, formatDurationHours } from '../utils/dateUtils';

interface IssuesSectionProps {
  issues: Issue[];
  projectItems: ProjectItem[];
  owner: string;
  repo: string;
}

export const IssuesSection: React.FC<IssuesSectionProps> = ({
  issues,
  projectItems,
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
              Issues
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {issues.length} issues in this period
            </Typography>
          </div>
          <Button variant="outlined" startIcon={<Settings />}>
            Filter
          </Button>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Issue #</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Comments</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Closed?</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Time to Close</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Assignees</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Labels</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Linked PR(s)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((issue) => {
              // Use backend time_to_close_hours if available, otherwise calculate it
              const timeToClose = issue.time_to_close_hours ?? 
                (issue.closed_at 
                  ? (() => {
                      const created = new Date(issue.created_at);
                      const closed = new Date(issue.closed_at);
                      const diffMs = closed.getTime() - created.getTime();
                      const diffHours = diffMs / (1000 * 60 * 60);
                      return diffHours;
                    })()
                  : null);

              // Render assignees
              const renderAssignees = () => {
                if (!issue.assignees || issue.assignees.length === 0) {
                  return <span>—</span>;
                }

                if (issue.assignees.length === 1) {
                  return (
                    <Link
                      href={`https://github.com/${issue.assignees[0]}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {issue.assignees[0]}
                    </Link>
                  );
                }

                return (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {issue.assignees.map((assignee, index) => (
                      <span key={assignee}>
                        <Link
                          href={`https://github.com/${assignee}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {assignee}
                        </Link>
                        {index < issue.assignees.length - 1 && ', '}
                      </span>
                    ))}
                  </Box>
                );
              };

              // Render labels
              const renderLabels = () => {
                if (!issue.labels || issue.labels.length === 0) {
                  return <span>—</span>;
                }

                return (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {issue.labels.slice(0, 2).map((label) => (
                      <Chip
                        key={label}
                        label={label}
                        size="small"
                        variant="outlined"
                        color="default"
                      />
                    ))}
                    {issue.labels.length > 2 && (
                      <Chip
                        label={`+${issue.labels.length - 2}`}
                        size="small"
                        variant="outlined"
                        color="default"
                      />
                    )}
                  </Box>
                );
              };

              // Render linked PRs
              const renderLinkedPRs = () => {
                if (!issue.linked_prs || issue.linked_prs.length === 0) {
                  return <span>—</span>;
                }

                return (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {issue.linked_prs.map((prNum, index) => (
                      <span key={prNum}>
                        <Link
                          href={`https://github.com/${owner}/${repo}/pull/${prNum}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          #{prNum}
                        </Link>
                        {index < issue.linked_prs.length - 1 && ', '}
                      </span>
                    ))}
                  </Box>
                );
              };

              return (
                <TableRow key={issue.number}>
                  <TableCell>
                    <Link href={issue.url} target="_blank" rel="noreferrer">
                      #{issue.number}
                    </Link>
                  </TableCell>
                  <TableCell>{issue.title}</TableCell>
                  <TableCell>
                    <Link
                      href={`https://github.com/${issue.author}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {issue.author}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(issue.created_at)}</TableCell>
                  <TableCell>{issue.comments ?? 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={issue.closed_at ? 'Closed' : 'Open'}
                      size="small"
                      color={issue.closed_at ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDurationHours(timeToClose)}</TableCell>
                  <TableCell>{renderAssignees()}</TableCell>
                  <TableCell>{renderLabels()}</TableCell>
                  <TableCell>{renderLinkedPRs()}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

import React, { useState, useMemo } from 'react';
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
  TableSortLabel,
} from '@mui/material';
import { Settings } from '@mui/icons-material';
import { Issue } from '../types';
import { formatDate } from '../utils/dateUtils';

const truncateTitle = (title: string, maxLength: number = 50): string => {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + '...';
};

interface IssuesSectionProps {
  issues: Issue[];
  owner: string;
  repo: string;
}

export const IssuesSection: React.FC<IssuesSectionProps> = ({
  issues,
  owner,
  repo,
}) => {
  const [sortBy, setSortBy] = useState<keyof Issue>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sort issues based on current sort criteria
  const sortedIssues = useMemo(() => {
    return [...issues].sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      // Handle special sorting cases
      if (sortBy === 'created_at' || sortBy === 'closed_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (sortBy === 'comments') {
        aValue = aValue ?? 0;
        bValue = bValue ?? 0;
      } else if (sortBy === 'assignees') {
        aValue = aValue?.length ?? 0;
        bValue = bValue?.length ?? 0;
      } else if (sortBy === 'labels') {
        aValue = aValue?.length ?? 0;
        bValue = bValue?.length ?? 0;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [issues, sortBy, sortDirection]);

  const handleSort = (column: keyof Issue) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
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
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === 'number'}
                  direction={sortBy === 'number' ? sortDirection : 'asc'}
                  onClick={() => handleSort('number')}
                >
                  Issue #
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === 'title'}
                  direction={sortBy === 'title' ? sortDirection : 'asc'}
                  onClick={() => handleSort('title')}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === 'author'}
                  direction={sortBy === 'author' ? sortDirection : 'asc'}
                  onClick={() => handleSort('author')}
                >
                  Author
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === 'created_at'}
                  direction={sortBy === 'created_at' ? sortDirection : 'asc'}
                  onClick={() => handleSort('created_at')}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === 'closed_at'}
                  direction={sortBy === 'closed_at' ? sortDirection : 'asc'}
                  onClick={() => handleSort('closed_at')}
                >
                  Closed
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === 'comments'}
                  direction={sortBy === 'comments' ? sortDirection : 'asc'}
                  onClick={() => handleSort('comments')}
                >
                  Comments
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === 'closed_at'}
                  direction={sortBy === 'closed_at' ? sortDirection : 'asc'}
                  onClick={() => handleSort('closed_at')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === 'assignees'}
                  direction={sortBy === 'assignees' ? sortDirection : 'asc'}
                  onClick={() => handleSort('assignees')}
                >
                  Assignees
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                <TableSortLabel
                  active={sortBy === 'labels'}
                  direction={sortBy === 'labels' ? sortDirection : 'asc'}
                  onClick={() => handleSort('labels')}
                >
                  Labels
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Linked PR(s)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedIssues.map((issue) => {
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
                  <TableCell
                    title={issue.title}
                    sx={{
                      maxWidth: 300,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {truncateTitle(issue.title)}
                  </TableCell>
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
                  <TableCell>
                    {issue.closed_at ? formatDate(issue.closed_at) : '—'}
                  </TableCell>
                  <TableCell>{issue.comments ?? 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={issue.closed_at ? 'Closed' : 'Open'}
                      size="small"
                      color={issue.closed_at ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
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

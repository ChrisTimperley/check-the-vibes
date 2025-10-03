import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Link,
  Chip,
} from '@mui/material';
import { Commit } from '../types';
import { formatDateTime } from '../utils/dateUtils';

interface CommitsSectionProps {
  commits: Commit[];
  owner: string;
  repo: string;
}

export const CommitsSection: React.FC<CommitsSectionProps> = ({
  commits: commits,
  owner,
  repo,
}) => {
  const [sortBy, setSortBy] = useState<keyof Commit>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sort commits based on current sort criteria
  const sortedCommits = useMemo(() => {
    return [...commits].sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      // Handle special sorting cases
      if (sortBy === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortBy === 'additions' || sortBy === 'deletions') {
        aValue = aValue ?? 0;
        bValue = bValue ?? 0;
      } else if (sortBy === 'pr') {
        aValue = aValue ?? Number.MAX_SAFE_INTEGER; // Put null PRs at the end
        bValue = bValue ?? Number.MAX_SAFE_INTEGER;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [commits, sortBy, sortDirection]);

  const handleSort = (column: keyof Commit) => {
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
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <div>
            <Typography variant="h5" component="h2" gutterBottom>
              All Commits
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All commits on the default branch
            </Typography>
          </div>
        </Box>

        {commits && commits.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>SHA</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={sortBy === 'committer'}
                    direction={sortBy === 'committer' ? sortDirection : 'asc'}
                    onClick={() => handleSort('committer')}
                  >
                    Committer
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={sortBy === 'message'}
                    direction={sortBy === 'message' ? sortDirection : 'asc'}
                    onClick={() => handleSort('message')}
                  >
                    Message
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={sortBy === 'additions'}
                    direction={sortBy === 'additions' ? sortDirection : 'asc'}
                    onClick={() => handleSort('additions')}
                  >
                    Lines
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={sortBy === 'date'}
                    direction={sortBy === 'date' ? sortDirection : 'asc'}
                    onClick={() => handleSort('date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={sortBy === 'pr'}
                    direction={sortBy === 'pr' ? sortDirection : 'asc'}
                    onClick={() => handleSort('pr')}
                  >
                    PR
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={sortBy === 'ci_status'}
                    direction={sortBy === 'ci_status' ? sortDirection : 'asc'}
                    onClick={() => handleSort('ci_status')}
                  >
                    CI
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedCommits.map((c) => (
                <TableRow key={c.sha}>
                  <TableCell>
                    <Link
                      href={`https://github.com/${owner}/${repo}/commit/${c.sha}`}
                      target="_blank"
                      rel="noreferrer"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {c.sha.slice(0, 7)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`https://github.com/${c.committer}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {c.committer}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 400 }}>
                    {c.message.length > 60
                      ? `${c.message.slice(0, 60)}...`
                      : c.message}
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
                        label={`+${c.additions ?? 0}`}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={`-${c.deletions ?? 0}`}
                        size="small"
                        color="error"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{formatDateTime(c.date)}</TableCell>
                  <TableCell>
                    {c.pr ? (
                      <Link
                        href={`https://github.com/${owner}/${repo}/pull/${c.pr}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        #{c.pr}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        c.ci_status === 'none'
                          ? 'No CI'
                          : c.ci_status === 'pending'
                            ? 'Pending'
                            : (c.ci_status ?? 'unknown')
                      }
                      size="small"
                      color={
                        c.ci_status === 'pass'
                          ? 'success'
                          : c.ci_status === 'fail'
                            ? 'error'
                            : c.ci_status === 'pending'
                              ? 'warning'
                              : 'default'
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No commits found in this period
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

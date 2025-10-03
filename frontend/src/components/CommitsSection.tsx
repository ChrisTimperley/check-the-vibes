import React from 'react';
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
                <TableCell sx={{ fontWeight: 700 }}>Committer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Lines</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PR</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CI</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commits.map((c) => (
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
                  <TableCell>—</TableCell>
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

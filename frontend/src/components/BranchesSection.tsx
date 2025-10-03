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
  Avatar,
  AvatarGroup,
} from '@mui/material';
import { Branch } from '../types';
import { formatDateTime } from '../utils/dateUtils';

interface BranchesSectionProps {
  branches: Branch[];
  owner: string;
  repo: string;
}

export const BranchesSection: React.FC<BranchesSectionProps> = ({
  branches,
  owner,
  repo,
}) => {
  const [sortBy, setSortBy] = useState<keyof Branch>('last_commit_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sort branches based on current sort criteria
  const sortedBranches = useMemo(() => {
    return [...branches].sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      // Handle special sorting cases
      if (sortBy === 'last_commit_date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortBy === 'ahead_by' || sortBy === 'behind_by') {
        aValue = aValue ?? 0;
        bValue = bValue ?? 0;
      } else if (sortBy === 'contributors') {
        aValue = a.contributors.length;
        bValue = b.contributors.length;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [branches, sortBy, sortDirection]);

  const handleSort = (column: keyof Branch) => {
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
              Branches
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {branches.length} active branches in this repository
            </Typography>
          </div>
        </Box>

        {branches && branches.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={sortBy === 'name'}
                    direction={sortBy === 'name' ? sortDirection : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Branch Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={sortBy === 'contributors'}
                    direction={sortBy === 'contributors' ? sortDirection : 'asc'}
                    onClick={() => handleSort('contributors')}
                  >
                    Contributors
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={sortBy === 'last_commit_date'}
                    direction={
                      sortBy === 'last_commit_date' ? sortDirection : 'asc'
                    }
                    onClick={() => handleSort('last_commit_date')}
                  >
                    Last Updated
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Last Commit</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={sortBy === 'ahead_by'}
                    direction={sortBy === 'ahead_by' ? sortDirection : 'asc'}
                    onClick={() => handleSort('ahead_by')}
                  >
                    Ahead
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active={sortBy === 'behind_by'}
                    direction={sortBy === 'behind_by' ? sortDirection : 'asc'}
                    onClick={() => handleSort('behind_by')}
                  >
                    Behind
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedBranches.map((branch) => (
                <TableRow key={branch.name}>
                  <TableCell>
                    <Link
                      href={branch.url}
                      target="_blank"
                      rel="noreferrer"
                      sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                    >
                      {branch.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                        {branch.contributors.map((contributor) => (
                          <Avatar
                            key={contributor}
                            alt={contributor}
                            src={`https://avatars.githubusercontent.com/${contributor}`}
                            sx={{ width: 24, height: 24 }}
                          >
                            {contributor[0].toUpperCase()}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                      {branch.contributors.length > 5 && (
                        <Typography variant="caption" color="text.secondary">
                          +{branch.contributors.length - 5}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDateTime(branch.last_commit_date)}</TableCell>
                  <TableCell>
                    <Link
                      href={`https://github.com/${owner}/${repo}/commit/${branch.last_commit_sha}`}
                      target="_blank"
                      rel="noreferrer"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {branch.last_commit_sha.slice(0, 7)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {branch.ahead_by !== undefined ? (
                      <Chip
                        label={branch.ahead_by}
                        size="small"
                        color={branch.ahead_by > 0 ? 'success' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    {branch.behind_by !== undefined ? (
                      <Chip
                        label={branch.behind_by}
                        size="small"
                        color={branch.behind_by > 0 ? 'warning' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No branches found
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

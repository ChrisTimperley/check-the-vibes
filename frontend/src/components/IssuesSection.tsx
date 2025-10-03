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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Badge,
} from '@mui/material';
import { Settings, FilterAlt } from '@mui/icons-material';
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

interface IssueFilters {
  author: string;
  status: 'all' | 'open' | 'closed';
  linkedPR: 'all' | 'with' | 'without';
  dateFrom: string;
  dateTo: string;
}

export const IssuesSection: React.FC<IssuesSectionProps> = ({
  issues,
  owner,
  repo,
}) => {
  const [sortBy, setSortBy] = useState<keyof Issue>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<IssueFilters>({
    author: '',
    status: 'all',
    linkedPR: 'all',
    dateFrom: '',
    dateTo: '',
  });

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

  // Apply filters to sorted issues
  const filteredIssues = useMemo(() => {
    return sortedIssues.filter((issue) => {
      // Author filter
      if (filters.author && !issue.author.toLowerCase().includes(filters.author.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filters.status === 'open' && issue.is_closed) {
        return false;
      }
      if (filters.status === 'closed' && !issue.is_closed) {
        return false;
      }

      // Linked PR filter
      if (filters.linkedPR === 'with' && (!issue.linked_prs || issue.linked_prs.length === 0)) {
        return false;
      }
      if (filters.linkedPR === 'without' && issue.linked_prs && issue.linked_prs.length > 0) {
        return false;
      }

      // Date from filter
      if (filters.dateFrom && new Date(issue.created_at) < new Date(filters.dateFrom)) {
        return false;
      }

      // Date to filter
      if (filters.dateTo && new Date(issue.created_at) > new Date(filters.dateTo)) {
        return false;
      }

      return true;
    });
  }, [sortedIssues, filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.author) count++;
    if (filters.status !== 'all') count++;
    if (filters.linkedPR !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  const handleSort = (column: keyof Issue) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      author: '',
      status: 'all',
      linkedPR: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  const handleApplyFilters = () => {
    setFilterDialogOpen(false);
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
              {filteredIssues.length} of {issues.length} issues
            </Typography>
          </div>
          <Badge badgeContent={activeFilterCount} color="primary">
            <Button 
              variant="outlined" 
              startIcon={<FilterAlt />}
              onClick={() => setFilterDialogOpen(true)}
            >
              Filter
            </Button>
          </Badge>
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
            {filteredIssues.map((issue) => {
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

        {/* Filter Dialog */}
        <Dialog 
          open={filterDialogOpen} 
          onClose={() => setFilterDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Filter Issues</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              {/* Author Filter */}
              <TextField
                label="Author"
                placeholder="Filter by author username"
                value={filters.author}
                onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                fullWidth
                size="small"
              />

              {/* Status Filter */}
              <FormControl>
                <FormLabel>Status</FormLabel>
                <RadioGroup
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as IssueFilters['status'] })}
                >
                  <FormControlLabel value="all" control={<Radio />} label="All" />
                  <FormControlLabel value="open" control={<Radio />} label="Open" />
                  <FormControlLabel value="closed" control={<Radio />} label="Closed" />
                </RadioGroup>
              </FormControl>

              {/* Linked PR Filter */}
              <FormControl>
                <FormLabel>Linked Pull Request</FormLabel>
                <RadioGroup
                  value={filters.linkedPR}
                  onChange={(e) => setFilters({ ...filters, linkedPR: e.target.value as IssueFilters['linkedPR'] })}
                >
                  <FormControlLabel value="all" control={<Radio />} label="All" />
                  <FormControlLabel value="with" control={<Radio />} label="Has linked PR" />
                  <FormControlLabel value="without" control={<Radio />} label="No linked PR" />
                </RadioGroup>
              </FormControl>

              {/* Date Range Filter */}
              <Box>
                <FormLabel>Created Date Range</FormLabel>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <TextField
                    label="From"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="To"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                  />
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClearFilters}>Clear All</Button>
            <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApplyFilters} variant="contained">Apply</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

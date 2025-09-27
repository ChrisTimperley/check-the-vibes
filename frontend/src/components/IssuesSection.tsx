import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Link } from '@mui/material';
import { CheckCircle, Schedule, People, Comment } from '@mui/icons-material';
import { Issue, ProjectItem } from '../types';
import { formatDate } from '../utils/dateUtils';

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
        <Typography variant="h5" component="h2" gutterBottom>
          Issues
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {issues.length} issues in this period
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {issues.map((issue) => (
            <Card
              key={issue.number}
              variant="outlined"
              sx={{ p: 2, minWidth: 350, flexGrow: 1 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="h6" component="div">
                  <Link
                    href={`https://github.com/${owner}/${repo}/issues/${issue.number}`}
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                  >
                    #{issue.number}
                  </Link>
                </Typography>
                <Chip
                  label={issue.closed_at ? 'Closed' : 'Open'}
                  color={issue.closed_at ? 'success' : 'warning'}
                  size="small"
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                {issue.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                by{' '}
                <Link
                  href={`https://github.com/${issue.author}`}
                  target="_blank"
                  rel="noreferrer"
                  underline="hover"
                >
                  {issue.author}
                </Link>{' '}
                • {formatDate(issue.created_at)}
              </Typography>

              {/* Issue checks: project board membership, has labels, comments */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                {/* appears in project board */}
                <Chip
                  icon={
                    projectItems.some(
                      (it) =>
                        it.type === 'Issue' &&
                        (it.title === issue.title ||
                          (it.linked_artifact &&
                            it.linked_artifact.includes(`#${issue.number}`)))
                    ) ? (
                      <CheckCircle />
                    ) : (
                      <Schedule />
                    )
                  }
                  label={
                    projectItems.some(
                      (it) =>
                        it.type === 'Issue' &&
                        (it.title === issue.title ||
                          (it.linked_artifact &&
                            it.linked_artifact.includes(`#${issue.number}`)))
                    )
                      ? 'On Board'
                      : 'No Board'
                  }
                  size="small"
                  color={
                    projectItems.some(
                      (it) =>
                        it.type === 'Issue' &&
                        (it.title === issue.title ||
                          (it.linked_artifact &&
                            it.linked_artifact.includes(`#${issue.number}`)))
                    )
                      ? 'success'
                      : 'warning'
                  }
                />

                {/* assignment check */}
                <Chip
                  icon={<People />}
                  label={
                    issue.assignees && issue.assignees.length > 0
                      ? 'Assigned'
                      : 'Unassigned'
                  }
                  size="small"
                  color={
                    issue.assignees && issue.assignees.length > 0
                      ? 'success'
                      : 'error'
                  }
                />

                {/* has labels */}
                <Chip
                  label={
                    issue.labels && issue.labels.length > 0
                      ? 'Has labels'
                      : 'No labels'
                  }
                  size="small"
                  color={
                    issue.labels && issue.labels.length > 0
                      ? 'primary'
                      : 'default'
                  }
                />

                {/* comments count */}
                <Chip
                  icon={<Comment />}
                  label={
                    typeof issue.comments === 'number'
                      ? `${issue.comments} comments`
                      : 'No comments'
                  }
                  size="small"
                  variant="outlined"
                />
              </Box>

              {issue.assignees.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                    Assigned to:
                  </Typography>
                  {issue.assignees.map((assignee) => (
                    <Link
                      key={assignee}
                      href={`https://github.com/${assignee}`}
                      target="_blank"
                      rel="noreferrer"
                      underline="none"
                    >
                      <Chip
                        label={assignee}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5 }}
                        clickable
                      />
                    </Link>
                  ))}
                </Box>
              )}

              {issue.labels.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {issue.labels.slice(0, 3).map((label) => (
                    <Chip
                      key={label}
                      label={label}
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  ))}
                  {issue.labels.length > 3 && (
                    <Chip
                      label={`+${issue.labels.length - 3} more`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              )}
            </Card>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

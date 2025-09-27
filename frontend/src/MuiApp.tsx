import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Box,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link,
} from '@mui/material';
import {
  Refresh,
  Download,
  Settings,
  People,
  CallMerge,
  BugReport,
  CheckCircle,
  Schedule,
  TrendingUp,
  Comment,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { mockAnalysisData } from './data/mockData';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#fafafa',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const month = MONTHS_SHORT[d.getMonth()] || '';
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

function App() {
  const [data, setData] = useState(mockAnalysisData);
  const [timeWindow, setTimeWindow] = useState('14');

  const fetchCommits = async () => {
    try {
      console.log('Fetching commits from API...');
      const repo = 'ChrisTimperley/check-the-vibes';
      const response = await fetch(`http://localhost:8000/commits?repo=${encodeURIComponent(repo)}&days=${timeWindow}`);
      if (!response.ok) {
        throw new Error('Failed to fetch commits');
      }
      const result = await response.json();
      console.log('Received commits:', result);

      // Update only the direct_pushes part with real data
      setData(prev => ({
        ...prev,
        direct_pushes: result.commits,
      }));
      console.log('Updated data with real commits');
    } catch (error) {
      console.error('Error fetching commits:', error);
    }
  };

  useEffect(() => {
    fetchCommits();
  }, [timeWindow]);

  const handleRefresh = () => {
    console.log('Refreshing data...');
    fetchCommits();
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const date = formatDate(iso);
    const time = d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${date} ${time}`;
  };

  const handleExport = () => {
    console.log('Exporting data...');
  };

  const getSeverityColor = (
    value: number,
    thresholds: { good: number; warning: number }
  ) => {
    if (value >= thresholds.good) return 'success';
    if (value >= thresholds.warning) return 'warning';
    return 'error';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'merged':
      case 'closed':
      case 'pass':
        return 'success';
      case 'open':
      case 'draft':
        return 'warning';
      case 'fail':
        return 'error';
      default:
        return 'default';
    }
  };

  const summaryCards = [
    {
      title: 'Contributors',
      value: data.summary.contributors_active,
      icon: People,
      description: 'Active contributors',
      color: 'primary',
    },
    {
      title: 'PRs Opened',
      value: data.summary.prs_opened,
      icon: CallMerge,
      description: 'Pull requests opened',
      color: 'secondary',
    },
    {
      title: 'Issues',
      value: `${data.summary.issues_opened}/${data.summary.issues_closed}`,
      icon: BugReport,
      description: 'Opened/Closed',
      color: 'info',
    },
    {
      title: 'PRs Reviewed',
      value: `${Math.round(data.summary.pct_prs_reviewed * 100)}%`,
      icon: CheckCircle,
      description: 'Percentage reviewed',
      color: getSeverityColor(data.summary.pct_prs_reviewed * 100, {
        good: 80,
        warning: 60,
      }),
    },
    {
      title: 'Cycle Time',
      value: `${data.summary.median_pr_cycle_time_hours.toFixed(1)}h`,
      icon: Schedule,
      description: 'Median PR cycle time',
      color: 'success',
    },
    {
      title: 'Stale Items',
      value: data.summary.stale_items,
      icon: TrendingUp,
      description: 'Items needing attention',
      color: getSeverityColor(10 - data.summary.stale_items, {
        good: 8,
        warning: 5,
      }),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Header */}
      <AppBar position="static" className="dashboard-header">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Check the Vibes - {data.repo}
          </Typography>

          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 120, mr: 2 }}
          >
            <Select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="14">Last 14 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
            </Select>
          </FormControl>

          <Button
            color="inherit"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            color="inherit"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <IconButton color="inherit">
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {/* Summary Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          {summaryCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card
                key={card.title}
                className="metric-card"
                sx={{ minWidth: 250, flexGrow: 1 }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <IconComponent
                      color={card.color as any}
                      sx={{ mr: 1, fontSize: 28 }}
                    />
                    <Typography variant="h6" component="h2">
                      {card.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ mb: 1, fontWeight: 'bold' }}
                  >
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Pull Requests Section */}
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
                  {data.pull_requests.length} pull requests in this period
                </Typography>
              </div>
              <Button variant="outlined" startIcon={<Settings />}>
                Filter
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {data.pull_requests.map((pr) => (
                <Card
                  key={pr.number}
                  variant="outlined"
                  sx={{ p: 2, minWidth: 300, flexGrow: 1 }}
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
                      #{pr.number}
                    </Typography>
                    <Chip
                      label={pr.status}
                      color={getStatusColor(pr.status) as any}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    {pr.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    by {pr.author} • {formatDate(pr.created_at)}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={pr.size_bucket}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={pr.reviewed ? 'Reviewed' : 'Not Reviewed'}
                      size="small"
                      color={pr.reviewed ? 'success' : 'error'}
                    />
                    <Chip
                      label={pr.linked_issues.length > 0 ? 'Linked' : 'No Link'}
                      size="small"
                      color={
                        pr.linked_issues.length > 0 ? 'success' : 'warning'
                      }
                    />
                    <Chip
                      label={pr.ci_status === 'none' ? 'No CI' : pr.ci_status}
                      size="small"
                      color={getStatusColor(pr.ci_status) as any}
                    />
                  </Box>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Contributors Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Contributors
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {data.contributors.length} active contributors in this period
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {data.contributors.map((contributor) => (
                <Card
                  key={contributor.login}
                  variant="outlined"
                  sx={{ minWidth: 300, flexGrow: 1 }}
                >
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {contributor.login}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">Commits:</Typography>
                      <Chip
                        label={contributor.commits}
                        size="small"
                        color="primary"
                      />
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">PRs:</Typography>
                      <Chip
                        label={contributor.prs}
                        size="small"
                        color="secondary"
                      />
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">Reviews:</Typography>
                      <Chip
                        label={contributor.reviews}
                        size="small"
                        color="info"
                      />
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">Issues:</Typography>
                      <Chip
                        label={contributor.issues}
                        size="small"
                        color="warning"
                      />
                    </Box>

                    {contributor.direct_pushes_default > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={`${contributor.direct_pushes_default} direct pushes`}
                          size="small"
                          color="error"
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Issues Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Issues
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {data.issues.length} issues in this period
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {data.issues.map((issue) => (
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
                      #{issue.number}
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

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    by {issue.author} • {formatDate(issue.created_at)}
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
                        data.project.items.some(
                          (it) =>
                            it.type === 'Issue' &&
                            (it.title === issue.title ||
                              (it.linked_artifact &&
                                it.linked_artifact.includes(
                                  `#${issue.number}`
                                )))
                        ) ? (
                          <CheckCircle />
                        ) : (
                          <Schedule />
                        )
                      }
                      label={
                        data.project.items.some(
                          (it) =>
                            it.type === 'Issue' &&
                            (it.title === issue.title ||
                              (it.linked_artifact &&
                                it.linked_artifact.includes(
                                  `#${issue.number}`
                                )))
                        )
                          ? 'On Board'
                          : 'No Board'
                      }
                      size="small"
                      color={
                        data.project.items.some(
                          (it) =>
                            it.type === 'Issue' &&
                            (it.title === issue.title ||
                              (it.linked_artifact &&
                                it.linked_artifact.includes(
                                  `#${issue.number}`
                                )))
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
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ mr: 1 }}
                      >
                        Assigned to:
                      </Typography>
                      {issue.assignees.map((assignee) => (
                        <Chip
                          key={assignee}
                          label={assignee}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5 }}
                        />
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

        {/* Repository Hygiene & Best Practices Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  Repository Hygiene & Best Practices ✨
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(() => {
                    // Calculate passed checks
                    const checks = [
                      data.hygiene.branch_protection.present,
                      data.hygiene.codeowners,
                      data.hygiene.security_policy,
                      data.hygiene.vulnerability_alerts,
                      data.hygiene.secret_scanning,
                      data.hygiene.dependency_scanning,
                      data.hygiene.readme_quality.has_description &&
                        data.hygiene.readme_quality.has_setup &&
                        data.hygiene.readme_quality.has_test,
                      data.hygiene.readme_quality.has_badges &&
                        data.hygiene.readme_quality.badges.length >= 3,
                      data.hygiene.contributing,
                      data.hygiene.code_of_conduct,
                      data.hygiene.license,
                      data.hygiene.changelog,
                      data.hygiene.issue_templates,
                      data.hygiene.pr_template,
                      data.hygiene.wiki_present,
                      data.hygiene.ci_present,
                      data.hygiene.test_coverage.present &&
                        data.hygiene.test_coverage.percentage >= 80,
                      data.hygiene.linting.present,
                      data.hygiene.formatting.present,
                      data.hygiene.precommit,
                      data.hygiene.editorconfig,
                      data.hygiene.gitignore_quality.present &&
                        data.hygiene.gitignore_quality.comprehensive,
                      data.hygiene.dependabot,
                      data.hygiene.security_advisories,
                      data.hygiene.package_lock,
                      data.hygiene.outdated_dependencies.count <= 5 &&
                        data.hygiene.outdated_dependencies.critical === 0,
                      data.hygiene.releases_recent,
                      data.hygiene.semantic_versioning,
                      data.hygiene.release_notes,
                      data.hygiene.tags_present,
                      data.hygiene.conventional_commits_rate >= 0.7,
                      data.hygiene.pr_size_check.large_pr_rate <= 0.3,
                      data.hygiene.review_coverage >= 0.8,
                      data.hygiene.merge_strategy.squash_enabled,
                      data.hygiene.discussions_enabled,
                      data.hygiene.projects_used,
                      data.hygiene.issue_response_time.sla_met,
                      data.hygiene.stale_issue_management,
                    ];
                    const passed = checks.filter(Boolean).length;
                    const total = checks.length;
                    const percentage = Math.round((passed / total) * 100);
                    return `${passed}/${total} checks passed (${percentage}%)`;
                  })()}
                </Typography>
              </Box>
            </Box>

            {/* Security Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                🔒 Repository Security
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor: data.hygiene.branch_protection.present
                      ? 'success.light'
                      : 'error.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.branch_protection.present ? (
                      <CheckCircle color="success" />
                    ) : (
                      <BugReport color="error" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      Branch Protection
                    </Typography>
                    <Chip label="High" size="small" color="error" />
                  </Box>
                  <Typography variant="body2">
                    {data.hygiene.branch_protection.required_reviews} required
                    reviews, Status checks:{' '}
                    {data.hygiene.branch_protection.status_checks_required
                      ? 'Yes'
                      : 'No'}
                  </Typography>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor: data.hygiene.codeowners
                      ? 'success.light'
                      : 'warning.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.codeowners ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Schedule color="warning" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      Code Owners
                    </Typography>
                    <Chip label="Medium" size="small" color="warning" />
                  </Box>
                  <Typography variant="body2">
                    CODEOWNERS file for mandatory code review assignment
                  </Typography>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor: data.hygiene.vulnerability_alerts
                      ? 'success.light'
                      : 'error.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.vulnerability_alerts ? (
                      <CheckCircle color="success" />
                    ) : (
                      <BugReport color="error" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      Vulnerability Alerts
                    </Typography>
                    <Chip label="High" size="small" color="error" />
                  </Box>
                  <Typography variant="body2">
                    GitHub vulnerability alerts enabled for dependencies
                  </Typography>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor: data.hygiene.secret_scanning
                      ? 'success.light'
                      : 'error.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.secret_scanning ? (
                      <CheckCircle color="success" />
                    ) : (
                      <BugReport color="error" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      Secret Scanning
                    </Typography>
                    <Chip label="High" size="small" color="error" />
                  </Box>
                  <Typography variant="body2">
                    GitHub secret scanning to prevent credential leaks
                  </Typography>
                </Card>
              </Box>
            </Box>

            {/* Code Quality Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                ⚙️ Code Quality
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor: data.hygiene.ci_present
                      ? 'success.light'
                      : 'error.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.ci_present ? (
                      <CheckCircle color="success" />
                    ) : (
                      <BugReport color="error" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      CI/CD Present
                    </Typography>
                    <Chip label="High" size="small" color="error" />
                  </Box>
                  <Typography variant="body2">
                    Continuous integration workflows configured
                  </Typography>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor:
                      data.hygiene.test_coverage.present &&
                      data.hygiene.test_coverage.percentage >= 80
                        ? 'success.light'
                        : 'warning.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.test_coverage.present &&
                    data.hygiene.test_coverage.percentage >= 80 ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Schedule color="warning" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      Test Coverage
                    </Typography>
                    <Chip label="High" size="small" color="error" />
                  </Box>
                  <Typography variant="body2">
                    {data.hygiene.test_coverage.percentage}% coverage{' '}
                    {data.hygiene.test_coverage.present
                      ? '(tracked)'
                      : '(not tracked)'}
                  </Typography>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor: data.hygiene.linting.present
                      ? 'success.light'
                      : 'warning.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.linting.present ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Schedule color="warning" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      Code Linting
                    </Typography>
                    <Chip label="Medium" size="small" color="warning" />
                  </Box>
                  <Typography variant="body2">
                    Tools: {data.hygiene.linting.tools.join(', ')}
                  </Typography>
                </Card>
              </Box>
            </Box>

            {/* Development Practices Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                🚀 Development Practices
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor:
                      data.hygiene.conventional_commits_rate >= 0.7
                        ? 'success.light'
                        : 'warning.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.conventional_commits_rate >= 0.7 ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Schedule color="warning" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      Conventional Commits
                    </Typography>
                    <Chip label="Medium" size="small" color="warning" />
                  </Box>
                  <Typography variant="body2">
                    {Math.round(data.hygiene.conventional_commits_rate * 100)}%
                    follow convention
                  </Typography>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor:
                      data.hygiene.review_coverage >= 0.8
                        ? 'success.light'
                        : 'error.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.review_coverage >= 0.8 ? (
                      <CheckCircle color="success" />
                    ) : (
                      <BugReport color="error" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      Review Coverage
                    </Typography>
                    <Chip label="High" size="small" color="error" />
                  </Box>
                  <Typography variant="body2">
                    {Math.round(data.hygiene.review_coverage * 100)}% of PRs
                    reviewed
                  </Typography>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor:
                      data.hygiene.pr_size_check.large_pr_rate <= 0.3
                        ? 'success.light'
                        : 'warning.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.pr_size_check.large_pr_rate <= 0.3 ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Schedule color="warning" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      PR Size Management
                    </Typography>
                    <Chip label="Medium" size="small" color="warning" />
                  </Box>
                  <Typography variant="body2">
                    Avg size: {data.hygiene.pr_size_check.average_size},{' '}
                    {Math.round(data.hygiene.pr_size_check.large_pr_rate * 100)}
                    % large
                  </Typography>
                </Card>
              </Box>
            </Box>

            {/* Documentation Section */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                📚 Documentation
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor:
                      data.hygiene.readme_quality.has_description &&
                      data.hygiene.readme_quality.has_setup
                        ? 'success.light'
                        : 'error.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.readme_quality.has_description &&
                    data.hygiene.readme_quality.has_setup ? (
                      <CheckCircle color="success" />
                    ) : (
                      <BugReport color="error" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      Comprehensive README
                    </Typography>
                    <Chip label="High" size="small" color="error" />
                  </Box>
                  <Typography variant="body2">
                    {data.hygiene.readme_quality.word_count} words, Setup &
                    Tests documented
                  </Typography>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor: data.hygiene.contributing
                      ? 'success.light'
                      : 'warning.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.contributing ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Schedule color="warning" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      Contributing Guide
                    </Typography>
                    <Chip label="Medium" size="small" color="warning" />
                  </Box>
                  <Typography variant="body2">
                    CONTRIBUTING.md with development guidelines
                  </Typography>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 280,
                    bgcolor: data.hygiene.license
                      ? 'success.light'
                      : 'error.light',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {data.hygiene.license ? (
                      <CheckCircle color="success" />
                    ) : (
                      <BugReport color="error" />
                    )}
                    <Typography variant="subtitle2" fontWeight="bold">
                      License
                    </Typography>
                    <Chip label="High" size="small" color="error" />
                  </Box>
                  <Typography variant="body2">
                    License file present for legal clarity
                  </Typography>
                </Card>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Direct Pushes Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <div>
                <Typography variant="h5" component="h2" gutterBottom>
                  Direct Pushes to main
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Commits pushed directly to the default branch in this period
                </Typography>
              </div>
            </Box>

            {data.direct_pushes && data.direct_pushes.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>SHA</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Committer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Message</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Lines</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>CI</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.direct_pushes.map((c) => (
                    <TableRow key={c.sha}>
                      <TableCell>
                        <Link
                          href={`https://github.com/${data.repo}/commit/${c.sha}`}
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
                          sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
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
                        <Chip
                          label={c.ci_status ?? 'unknown'}
                          size="small"
                          color={
                            c.ci_status === 'pass'
                              ? 'success'
                              : c.ci_status === 'fail'
                                ? 'error'
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
                No direct pushes detected in this period
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Analysis window: {formatDate(data.window.from)} -{' '}
            {formatDate(data.window.to)}
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;

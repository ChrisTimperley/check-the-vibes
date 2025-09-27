import { useState } from 'react';
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

function App() {
  const [data] = useState(mockAnalysisData);
  const [timeWindow, setTimeWindow] = useState('14');

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleExport = () => {
    console.log('Exporting data...');
  };

  const getSeverityColor = (value: number, thresholds: { good: number; warning: number }) => {
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
      color: getSeverityColor(data.summary.pct_prs_reviewed * 100, { good: 80, warning: 60 }),
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
      color: getSeverityColor(10 - data.summary.stale_items, { good: 8, warning: 5 }),
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

          <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
            <Select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="14">Last 14 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
            </Select>
          </FormControl>

          <Button color="inherit" startIcon={<Refresh />} onClick={handleRefresh} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button color="inherit" startIcon={<Download />} onClick={handleExport} sx={{ mr: 1 }}>
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
              <Card key={card.title} className="metric-card" sx={{ minWidth: 250, flexGrow: 1 }}>
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
                  <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
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
                <Card key={pr.number} variant="outlined" sx={{ p: 2, minWidth: 300, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
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

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    by {pr.author} • {new Date(pr.created_at).toLocaleDateString()}
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
                      color={pr.linked_issues.length > 0 ? 'success' : 'warning'}
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
                <Card key={contributor.login} variant="outlined" sx={{ minWidth: 300, flexGrow: 1 }}>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {contributor.login}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Commits:</Typography>
                      <Chip label={contributor.commits} size="small" color="primary" />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">PRs:</Typography>
                      <Chip label={contributor.prs} size="small" color="secondary" />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Reviews:</Typography>
                      <Chip label={contributor.reviews} size="small" color="info" />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Issues:</Typography>
                      <Chip label={contributor.issues} size="small" color="warning" />
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
                <Card key={issue.number} variant="outlined" sx={{ p: 2, minWidth: 350, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
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

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    by {issue.author} • {new Date(issue.created_at).toLocaleDateString()}
                  </Typography>

                  {issue.assignees.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" component="span" sx={{ mr: 1 }}>
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

        {/* Footer */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Analysis window: {new Date(data.window.from).toLocaleDateString()} - {new Date(data.window.to).toLocaleDateString()}
          </Typography>
          <Typography variant="body2">
            Overall Score: <strong>{data.scores.overall}/100</strong>
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;

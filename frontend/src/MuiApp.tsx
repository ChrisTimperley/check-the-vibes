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
  Avatar,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link,
  TextField,
  Paper,
} from '@mui/material';
import {
  Refresh,
  Download,
  Settings,
  People,
  BugReport,
  CheckCircle,
  Schedule,
  Comment,
  Search,
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
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const fetchCommits = async () => {
    if (!owner || !repo) {
      console.log('Owner and repo are required');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Fetching commits from API...');
      const repoName = `${owner}/${repo}`;
      const response = await fetch(
        `http://localhost:8000/commits?repo=${encodeURIComponent(repoName)}&days=${timeWindow}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch commits');
      }
      const commitsResult = await response.json();
      console.log('Received commits:', commitsResult);

      // Also fetch contributors from the new contributors endpoint so the UI updates
      const since = new Date();
      since.setDate(since.getDate() - Number(timeWindow));
      const contributorsResp = await fetch(
        `http://localhost:8000/contributors?repo=${encodeURIComponent(repoName)}&from=${encodeURIComponent(
          since.toISOString()
        )}&to=${encodeURIComponent(new Date().toISOString())}`
      );
      let contributorsResult: any = null;
      if (contributorsResp.ok) {
        // cast to any to avoid strict typing issues from the quick fetch
        contributorsResult = (await contributorsResp.json()) as any;
        console.log('Received contributors:', contributorsResult);
      } else {
        console.warn(
          'Failed to fetch contributors from API, deriving from commits as fallback'
        );
        // derive a lightweight contributors list from commitsResult as a fallback
        try {
          const map: Record<
            string,
            {
              login: string;
              commits: number;
              prs: number;
              reviews: number;
              issues: number;
              direct_pushes_default: number;
            }
          > = {};
          for (const c of commitsResult.commits || []) {
            const committer =
              (c.committer && c.committer.login) ||
              c.committer ||
              c.author ||
              c.commit?.author?.name ||
              'unknown';
            const login =
              typeof committer === 'string'
                ? committer
                : (committer && committer.login) || 'unknown';
            if (!map[login])
              map[login] = {
                login,
                commits: 0,
                prs: 0,
                reviews: 0,
                issues: 0,
                direct_pushes_default: 0,
              };
            map[login].commits += 1;
            map[login].direct_pushes_default += 1;
          }
          const derived = Object.values(map).map((c) => ({
            login: c.login,
            commits: c.commits,
            prs: c.prs,
            reviews: c.reviews,
            issues: c.issues,
            lines_added: 0,
            lines_deleted: 0,
            direct_pushes_default: c.direct_pushes_default,
            avatar_url: `https://avatars.githubusercontent.com/${c.login}`,
          }));
          contributorsResult = {
            contributors: derived,
            summary: { contributors_active: derived.length },
          } as any;
        } catch (e) {
          console.warn('Fallback derivation failed', e);
          contributorsResult = null;
        }
      }

      // Update data with real commits and contributors (if available)
      setData((prev: any) => ({
        ...prev,
        direct_pushes: commitsResult.commits,
        contributors: contributorsResult?.contributors ?? prev.contributors,
        summary: {
          ...prev.summary,
          contributors_active:
            (contributorsResult?.summary?.contributors_active as number) ??
            prev.summary.contributors_active,
        },
      }));
      console.log('Updated data with real commits and contributors');
      setHasAnalyzed(true);
    } catch (error) {
      console.error('Error fetching commits:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    console.log('Starting analysis...');
    fetchCommits();
  };

  // Only automatically fetch when we have repo info and analysis has been triggered
  useEffect(() => {
    if (hasAnalyzed && owner && repo) {
      fetchCommits();
    }
  }, [timeWindow, hasAnalyzed, owner, repo]);

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

  // status color helper removed — unused after rendering changes

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Header */}
      <AppBar position="static" className="dashboard-header">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Check the Vibes{' '}
            {hasAnalyzed && owner && repo && `- ${owner}/${repo}`}
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
        {/* Repository Input Form - Show only when no analysis has been done */}
        {!hasAnalyzed && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
              Repository Analysis
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Enter a GitHub repository to analyze its development workflow and
              vibes.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'flex-end',
              }}
            >
              <TextField
                label="Organization/Owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g., facebook"
                variant="outlined"
                sx={{ minWidth: 200, flex: 1 }}
              />
              <TextField
                label="Repository"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="e.g., react"
                variant="outlined"
                sx={{ minWidth: 200, flex: 1 }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<Search />}
                onClick={handleAnalyze}
                disabled={!owner || !repo || isAnalyzing}
                sx={{ py: 1.5, minWidth: 180 }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Repository'}
              </Button>
            </Box>
          </Paper>
        )}

        {/* Show analysis results only after analysis */}
        {hasAnalyzed && (
          <>
            {/* summary widgets removed per request */}

            {/* Pull Requests Section — rendered as a table per request */}
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
                    {data.pull_requests.map((pr) => {
                      // derive comments count from linked issues when available
                      let comments = 0;
                      let linkedIssueLabel = '—';
                      if (pr.linked_issues && pr.linked_issues.length > 0) {
                        const first = pr.linked_issues[0];
                        const issue = data.issues.find(
                          (i) => i.number === first
                        );
                        comments = issue?.comments ?? 0;
                        linkedIssueLabel = `#${first}`;
                      }
                      const reviewerName =
                        pr.reviewers && pr.reviewers.length > 0
                          ? pr.reviewers[0]
                          : null;
                      // linesChanged is displayed using additions/deletions chips below

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

            {/* Contributors Section */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Contributors
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
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
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <Avatar
                            src={
                              contributor.avatar_url ||
                              `https://avatars.githubusercontent.com/${contributor.login}`
                            }
                            alt={contributor.login}
                            sx={{ width: 40, height: 40, mr: 1 }}
                          >
                            {contributor.login
                              ? contributor.login[0].toUpperCase()
                              : ''}
                          </Avatar>
                          <Typography variant="h6" component="div">
                            {contributor.login}
                          </Typography>
                        </Box>

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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
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

                      <Typography
                        variant="body1"
                        sx={{ mb: 1, fontWeight: 500 }}
                      >
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
                        <Box
                          sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}
                        >
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
                  <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}
                  >
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
                        {data.hygiene.branch_protection.required_reviews}{' '}
                        required reviews, Status checks:{' '}
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
                  <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}
                  >
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
                  <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}
                  >
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
                        {Math.round(
                          data.hygiene.conventional_commits_rate * 100
                        )}
                        % follow convention
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
                        {Math.round(
                          data.hygiene.pr_size_check.large_pr_rate * 100
                        )}
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
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <div>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Direct Pushes to main
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Commits pushed directly to the default branch in this
                      period
                    </Typography>
                  </div>
                </Box>

                {data.direct_pushes && data.direct_pushes.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>SHA</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Committer
                        </TableCell>
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
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;

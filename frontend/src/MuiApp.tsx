import { useState, useEffect } from 'react';
import { Typography, Container, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { mockAnalysisData } from './data/mockData';
import { theme } from './utils/theme';
import { formatDate } from './utils/dateUtils';
import {
  Header,
  RepositoryInput,
  PullRequestsSection,
  ContributorsSection,
  IssuesSection,
  DirectPushesSection,
} from './components';

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

  const handleExport = () => {
    console.log('Exporting data...');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Header
        hasAnalyzed={hasAnalyzed}
        owner={owner}
        repo={repo}
        timeWindow={timeWindow}
        onTimeWindowChange={setTimeWindow}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {/* Repository Input Form - Show only when no analysis has been done */}
        {!hasAnalyzed && (
          <RepositoryInput
            owner={owner}
            repo={repo}
            isAnalyzing={isAnalyzing}
            onOwnerChange={setOwner}
            onRepoChange={setRepo}
            onAnalyze={handleAnalyze}
          />
        )}

        {/* Show analysis results only after analysis */}
        {hasAnalyzed && (
          <>
            <PullRequestsSection
              pullRequests={data.pull_requests}
              issues={data.issues}
            />

            <ContributorsSection contributors={data.contributors} />

            <IssuesSection
              issues={data.issues}
              projectItems={data.project.items}
            />

            <DirectPushesSection
              directPushes={data.direct_pushes || []}
              owner={owner}
              repo={repo}
            />

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

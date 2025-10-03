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
  CommitsSection,
} from './components';

function App() {
  const [data, setData] = useState(mockAnalysisData);
  const [timeWindow, setTimeWindow] = useState('14');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showRepositoryInput, setShowRepositoryInput] = useState(false);

  const fetchAnalysisData = async () => {
    if (!owner || !repo) {
      console.log('Owner and repo are required');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Fetching analysis data from API...');
      const repoName = `${owner}/${repo}`;
      const since = new Date();
      since.setDate(since.getDate() - Number(timeWindow));

      const response = await fetch(
        `http://localhost:8000/analyze?repo=${encodeURIComponent(repoName)}&from=${encodeURIComponent(
          since.toISOString()
        )}&to=${encodeURIComponent(new Date().toISOString())}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch analysis data: ${response.statusText}`
        );
      }

      const analysisResult = await response.json();
      console.log('Received analysis data:', analysisResult);

      // Update data with real analysis data
      setData(analysisResult);
      console.log('Updated data with real analysis from backend');
      setHasAnalyzed(true);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    console.log('Starting analysis...');
    setShowRepositoryInput(false);
    setHasAnalyzed(true);
    fetchAnalysisData();
  };

  // Only automatically re-fetch when time window changes (after initial analysis)
  useEffect(() => {
    if (hasAnalyzed && owner && repo && !showRepositoryInput) {
      fetchAnalysisData();
    }
  }, [timeWindow]);

  const handleRefresh = () => {
    console.log('Refreshing data...');
    fetchAnalysisData();
  };

  const handleChangeRepository = () => {
    console.log('Changing repository...');
    setShowRepositoryInput(true);
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
        onChangeRepository={handleChangeRepository}
      />

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {/* Repository Input Form - Show when no analysis has been done OR when user wants to change repo */}
        {(!hasAnalyzed || showRepositoryInput) && (
          <RepositoryInput
            owner={owner}
            repo={repo}
            isAnalyzing={isAnalyzing}
            onOwnerChange={setOwner}
            onRepoChange={setRepo}
            onAnalyze={handleAnalyze}
          />
        )}

        {/* Show analysis results only after analysis and when not changing repository */}
        {hasAnalyzed && !showRepositoryInput && (
          <>
            <ContributorsSection
              contributors={data.contributors}
              pullRequests={data.pull_requests}
              issues={data.issues}
            />

            <IssuesSection issues={data.issues} owner={owner} repo={repo} />

            <PullRequestsSection
              pullRequests={data.pull_requests}
              issues={data.issues}
              owner={owner}
              repo={repo}
            />

            <CommitsSection
              commits={data.commits || []}
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

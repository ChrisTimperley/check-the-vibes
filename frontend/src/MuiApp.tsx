import { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  Box,
  CircularProgress,
  Paper,
} from '@mui/material';
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
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showRepositoryInput, setShowRepositoryInput] = useState(false);

  // Initialize dates: default to last 14 days
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 14);
    return date.toISOString().split('T')[0];
  };

  const getDefaultEndDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());

  const fetchAnalysisData = async () => {
    if (!owner || !repo || !startDate || !endDate) {
      console.log('Owner, repo, and dates are required');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Fetching analysis data from API...');
      const repoName = `${owner}/${repo}`;
      const fromDate = new Date(startDate);
      const toDate = new Date(endDate);
      // Set to end of day for the end date
      toDate.setHours(23, 59, 59, 999);

      const response = await fetch(
        `http://localhost:8000/analyze?repo=${encodeURIComponent(repoName)}&from=${encodeURIComponent(
          fromDate.toISOString()
        )}&to=${encodeURIComponent(toDate.toISOString())}`
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

  // Only automatically re-fetch when dates change (after initial analysis)
  useEffect(() => {
    if (hasAnalyzed && owner && repo && !showRepositoryInput) {
      fetchAnalysisData();
    }
  }, [startDate, endDate]);

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
        onRefresh={handleRefresh}
        onChangeRepository={handleChangeRepository}
      />

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {/* Repository Input Form - Show when no analysis has been done OR when user wants to change repo */}
        {(!hasAnalyzed || showRepositoryInput) && (
          <RepositoryInput
            owner={owner}
            repo={repo}
            startDate={startDate}
            endDate={endDate}
            isAnalyzing={isAnalyzing}
            onOwnerChange={setOwner}
            onRepoChange={setRepo}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onAnalyze={handleAnalyze}
          />
        )}

        {/* Loading indicator */}
        {isAnalyzing && (
          <Paper
            sx={{
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
              Analyzing {owner}/{repo}...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This may take a moment for large repositories
            </Typography>
          </Paper>
        )}

        {/* Show analysis results only after analysis and when not changing repository */}
        {hasAnalyzed && !showRepositoryInput && !isAnalyzing && (
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

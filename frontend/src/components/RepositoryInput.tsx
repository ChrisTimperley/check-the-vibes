import React from 'react';
import { Typography, Button, TextField, Box, Paper } from '@mui/material';
import { Search, Cancel } from '@mui/icons-material';

interface RepositoryInputProps {
  owner: string;
  repo: string;
  isAnalyzing: boolean;
  onOwnerChange: (value: string) => void;
  onRepoChange: (value: string) => void;
  onAnalyze: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const RepositoryInput: React.FC<RepositoryInputProps> = ({
  owner,
  repo,
  isAnalyzing,
  onOwnerChange,
  onRepoChange,
  onAnalyze,
  onCancel,
  showCancel = false,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Repository Analysis
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Enter a GitHub repository to analyze its development workflow and vibes.
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
          onChange={(e) => onOwnerChange(e.target.value)}
          placeholder="e.g., facebook"
          variant="outlined"
          sx={{ minWidth: 200, flex: 1 }}
        />
        <TextField
          label="Repository"
          value={repo}
          onChange={(e) => onRepoChange(e.target.value)}
          placeholder="e.g., react"
          variant="outlined"
          sx={{ minWidth: 200, flex: 1 }}
        />
        <Button
          variant="contained"
          size="large"
          startIcon={<Search />}
          onClick={onAnalyze}
          disabled={!owner || !repo || isAnalyzing}
          sx={{ py: 1.5, minWidth: 180 }}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Repository'}
        </Button>
        {showCancel && (
          <Button
            variant="outlined"
            size="large"
            startIcon={<Cancel />}
            onClick={onCancel}
            disabled={isAnalyzing}
            sx={{ py: 1.5, minWidth: 120 }}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Paper>
  );
};

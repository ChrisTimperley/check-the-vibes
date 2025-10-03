import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Refresh, Settings, Edit } from '@mui/icons-material';

interface HeaderProps {
  hasAnalyzed: boolean;
  onRefresh: () => void;
  onChangeRepository: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasAnalyzed,
  onRefresh,
  onChangeRepository,
}) => {
  return (
    <AppBar position="static" className="dashboard-header">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Commit Culture
        </Typography>

        {hasAnalyzed && (
          <Button
            color="inherit"
            startIcon={<Edit />}
            onClick={onChangeRepository}
            sx={{ mr: 1 }}
          >
            Change Repository
          </Button>
        )}

        <IconButton color="inherit" onClick={onRefresh} sx={{ mr: 1 }}>
          <Refresh />
        </IconButton>
        <IconButton color="inherit">
          <Settings />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

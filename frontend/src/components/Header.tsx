import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { Refresh, Settings, Edit } from '@mui/icons-material';

interface HeaderProps {
  hasAnalyzed: boolean;
  owner: string;
  repo: string;
  timeWindow: string;
  onTimeWindowChange: (value: string) => void;
  onRefresh: () => void;
  onChangeRepository: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasAnalyzed,
  owner,
  repo,
  timeWindow,
  onTimeWindowChange,
  onRefresh,
  onChangeRepository,
}) => {
  return (
    <AppBar position="static" className="dashboard-header">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Check the Vibes {hasAnalyzed && owner && repo && `- ${owner}/${repo}`}
        </Typography>

        <FormControl
          variant="outlined"
          size="small"
          sx={{ minWidth: 120, mr: 2 }}
        >
          <Select
            value={timeWindow}
            onChange={(e) => onTimeWindowChange(e.target.value)}
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

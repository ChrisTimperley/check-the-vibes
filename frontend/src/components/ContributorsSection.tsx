import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import { Contributor } from '../types';

interface ContributorsSectionProps {
  contributors: Contributor[];
}

export const ContributorsSection: React.FC<ContributorsSectionProps> = ({
  contributors,
}) => {
  return (
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
          {contributors.length} active contributors in this period
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {contributors.map((contributor) => (
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
  );
};
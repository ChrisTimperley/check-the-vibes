import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  BugReport,
  Schedule,
} from '@mui/icons-material';
import { HygieneChecks } from '../types';

interface RepositoryHygieneSectionProps {
  hygiene: HygieneChecks;
}

export const RepositoryHygieneSection: React.FC<RepositoryHygieneSectionProps> = ({
  hygiene,
}) => {
  // Calculate passed checks
  const checks = [
    hygiene.branch_protection.present,
    hygiene.codeowners,
    hygiene.security_policy,
    hygiene.vulnerability_alerts,
    hygiene.secret_scanning,
    hygiene.dependency_scanning,
    hygiene.readme_quality.has_description &&
      hygiene.readme_quality.has_setup &&
      hygiene.readme_quality.has_test,
    hygiene.readme_quality.has_badges &&
      hygiene.readme_quality.badges.length >= 3,
    hygiene.contributing,
    hygiene.code_of_conduct,
    hygiene.license,
    hygiene.changelog,
    hygiene.issue_templates,
    hygiene.pr_template,
    hygiene.wiki_present,
    hygiene.ci_present,
    hygiene.test_coverage.present &&
      hygiene.test_coverage.percentage >= 80,
    hygiene.linting.present,
    hygiene.formatting.present,
    hygiene.precommit,
    hygiene.editorconfig,
    hygiene.gitignore_quality.present &&
      hygiene.gitignore_quality.comprehensive,
    hygiene.dependabot,
    hygiene.security_advisories,
    hygiene.package_lock,
    hygiene.outdated_dependencies.count <= 5 &&
      hygiene.outdated_dependencies.critical === 0,
    hygiene.releases_recent,
    hygiene.semantic_versioning,
    hygiene.release_notes,
    hygiene.tags_present,
    hygiene.conventional_commits_rate >= 0.7,
    hygiene.pr_size_check.large_pr_rate <= 0.3,
    hygiene.review_coverage >= 0.8,
    hygiene.merge_strategy.squash_enabled,
    hygiene.discussions_enabled,
    hygiene.projects_used,
    hygiene.issue_response_time.sla_met,
    hygiene.stale_issue_management,
  ];
  const passed = checks.filter(Boolean).length;
  const total = checks.length;
  const percentage = Math.round((passed / total) * 100);

  return (
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
              {passed}/{total} checks passed ({percentage}%)
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
                bgcolor: hygiene.branch_protection.present
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
                {hygiene.branch_protection.present ? (
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
                {hygiene.branch_protection.required_reviews}{' '}
                required reviews, Status checks:{' '}
                {hygiene.branch_protection.status_checks_required
                  ? 'Yes'
                  : 'No'}
              </Typography>
            </Card>

            <Card
              variant="outlined"
              sx={{
                p: 2,
                minWidth: 280,
                bgcolor: hygiene.codeowners
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
                {hygiene.codeowners ? (
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
                bgcolor: hygiene.vulnerability_alerts
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
                {hygiene.vulnerability_alerts ? (
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
                bgcolor: hygiene.secret_scanning
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
                {hygiene.secret_scanning ? (
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
                bgcolor: hygiene.ci_present
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
                {hygiene.ci_present ? (
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
                  hygiene.test_coverage.present &&
                  hygiene.test_coverage.percentage >= 80
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
                {hygiene.test_coverage.present &&
                hygiene.test_coverage.percentage >= 80 ? (
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
                {hygiene.test_coverage.percentage}% coverage{' '}
                {hygiene.test_coverage.present
                  ? '(tracked)'
                  : '(not tracked)'}
              </Typography>
            </Card>

            <Card
              variant="outlined"
              sx={{
                p: 2,
                minWidth: 280,
                bgcolor: hygiene.linting.present
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
                {hygiene.linting.present ? (
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
                Tools: {hygiene.linting.tools.join(', ')}
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
                  hygiene.conventional_commits_rate >= 0.7
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
                {hygiene.conventional_commits_rate >= 0.7 ? (
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
                  hygiene.conventional_commits_rate * 100
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
                  hygiene.review_coverage >= 0.8
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
                {hygiene.review_coverage >= 0.8 ? (
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
                {Math.round(hygiene.review_coverage * 100)}% of PRs
                reviewed
              </Typography>
            </Card>

            <Card
              variant="outlined"
              sx={{
                p: 2,
                minWidth: 280,
                bgcolor:
                  hygiene.pr_size_check.large_pr_rate <= 0.3
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
                {hygiene.pr_size_check.large_pr_rate <= 0.3 ? (
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
                Avg size: {hygiene.pr_size_check.average_size},{' '}
                {Math.round(
                  hygiene.pr_size_check.large_pr_rate * 100
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
                  hygiene.readme_quality.has_description &&
                  hygiene.readme_quality.has_setup
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
                {hygiene.readme_quality.has_description &&
                hygiene.readme_quality.has_setup ? (
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
                {hygiene.readme_quality.word_count} words, Setup &
                Tests documented
              </Typography>
            </Card>

            <Card
              variant="outlined"
              sx={{
                p: 2,
                minWidth: 280,
                bgcolor: hygiene.contributing
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
                {hygiene.contributing ? (
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
                bgcolor: hygiene.license
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
                {hygiene.license ? (
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
  );
};
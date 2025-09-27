import React from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  FileText,
  Code,
  Package,
  Tag,
  Users,
  Info,
} from 'lucide-react';
import { HygieneChecks } from '../types';

interface BestPracticesProps {
  hygiene: HygieneChecks;
}

interface Check {
  name: string;
  status: boolean;
  description: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  icon?: React.ComponentType<any>;
  recommendation?: string;
}

export function BestPractices({ hygiene }: BestPracticesProps) {
  const checks: Check[] = [
    // Repository Security
    {
      name: 'Branch Protection Rules',
      status:
        hygiene.branch_protection.present &&
        hygiene.branch_protection.required_reviews >= 1,
      description: `${hygiene.branch_protection.required_reviews} required reviews, Status checks: ${hygiene.branch_protection.status_checks_required ? 'Yes' : 'No'}`,
      category: 'Repository Security',
      severity: 'high',
      icon: Shield,
      recommendation:
        'Enable branch protection with at least 1 required review',
    },
    {
      name: 'Code Owners',
      status: hygiene.codeowners,
      description:
        'CODEOWNERS file present for mandatory code review assignment',
      category: 'Repository Security',
      severity: 'medium',
      icon: Shield,
    },
    {
      name: 'Security Policy',
      status: hygiene.security_policy,
      description: 'SECURITY.md file with vulnerability reporting guidelines',
      category: 'Repository Security',
      severity: 'medium',
    },
    {
      name: 'Vulnerability Alerts',
      status: hygiene.vulnerability_alerts,
      description: 'GitHub vulnerability alerts enabled for dependencies',
      category: 'Repository Security',
      severity: 'high',
      icon: Shield,
    },
    {
      name: 'Secret Scanning',
      status: hygiene.secret_scanning,
      description: 'GitHub secret scanning enabled to prevent credential leaks',
      category: 'Repository Security',
      severity: 'high',
      icon: Shield,
    },
    {
      name: 'Dependency Scanning',
      status: hygiene.dependency_scanning,
      description: 'Automated scanning for vulnerable dependencies',
      category: 'Repository Security',
      severity: 'high',
      icon: Shield,
    },

    // Documentation
    {
      name: 'Comprehensive README',
      status:
        hygiene.readme_quality.has_description &&
        hygiene.readme_quality.has_setup &&
        hygiene.readme_quality.has_test &&
        hygiene.readme_quality.word_count > 200,
      description: `${hygiene.readme_quality.word_count} words, Setup: ${hygiene.readme_quality.has_setup ? 'Yes' : 'No'}, Tests: ${hygiene.readme_quality.has_test ? 'Yes' : 'No'}`,
      category: 'Documentation',
      severity: 'high',
      icon: FileText,
    },
    {
      name: 'README Badges',
      status:
        hygiene.readme_quality.has_badges &&
        hygiene.readme_quality.badges.length >= 3,
      description: `${hygiene.readme_quality.badges.join(', ')} (${hygiene.readme_quality.badges.length} badges)`,
      category: 'Documentation',
      severity: 'low',
      icon: FileText,
    },
    {
      name: 'Contributing Guidelines',
      status: hygiene.contributing,
      description: 'CONTRIBUTING.md file with development guidelines',
      category: 'Documentation',
      severity: 'medium',
      icon: FileText,
    },
    {
      name: 'Code of Conduct',
      status: hygiene.code_of_conduct,
      description: 'CODE_OF_CONDUCT.md file establishing community standards',
      category: 'Documentation',
      severity: 'medium',
      icon: FileText,
    },
    {
      name: 'License',
      status: hygiene.license,
      description: 'License file present for legal clarity',
      category: 'Documentation',
      severity: 'high',
      icon: FileText,
    },
    {
      name: 'Changelog',
      status: hygiene.changelog,
      description: 'CHANGELOG.md file documenting version changes',
      category: 'Documentation',
      severity: 'medium',
      icon: FileText,
    },
    {
      name: 'Issue Templates',
      status: hygiene.issue_templates,
      description: 'Templates for consistent bug reports and feature requests',
      category: 'Documentation',
      severity: 'low',
    },
    {
      name: 'PR Template',
      status: hygiene.pr_template,
      description: 'Template for consistent pull request descriptions',
      category: 'Documentation',
      severity: 'low',
    },
    {
      name: 'Wiki Documentation',
      status: hygiene.wiki_present,
      description: 'Repository wiki enabled for extended documentation',
      category: 'Documentation',
      severity: 'low',
    },

    // Code Quality
    {
      name: 'Continuous Integration',
      status: hygiene.ci_present,
      description: 'CI/CD workflows configured for automated testing',
      category: 'Code Quality',
      severity: 'high',
      icon: Code,
    },
    {
      name: 'Test Coverage',
      status:
        hygiene.test_coverage.present && hygiene.test_coverage.percentage >= 80,
      description: `${hygiene.test_coverage.percentage}% test coverage ${hygiene.test_coverage.present ? '(tracked)' : '(not tracked)'}`,
      category: 'Code Quality',
      severity: 'high',
      icon: Code,
    },
    {
      name: 'Code Linting',
      status: hygiene.linting.present && hygiene.linting.tools.length > 0,
      description: `Linting tools: ${hygiene.linting.tools.join(', ')}`,
      category: 'Code Quality',
      severity: 'medium',
      icon: Code,
    },
    {
      name: 'Code Formatting',
      status: hygiene.formatting.present && hygiene.formatting.tools.length > 0,
      description: `Formatting tools: ${hygiene.formatting.tools.join(', ')}`,
      category: 'Code Quality',
      severity: 'medium',
      icon: Code,
    },
    {
      name: 'Pre-commit Hooks',
      status: hygiene.precommit,
      description: 'Pre-commit hooks configured to catch issues early',
      category: 'Code Quality',
      severity: 'medium',
      icon: Code,
    },
    {
      name: 'Editor Configuration',
      status: hygiene.editorconfig,
      description: '.editorconfig file for consistent code formatting',
      category: 'Code Quality',
      severity: 'low',
    },
    {
      name: 'Comprehensive .gitignore',
      status:
        hygiene.gitignore_quality.present &&
        hygiene.gitignore_quality.comprehensive,
      description: `.gitignore file ${hygiene.gitignore_quality.comprehensive ? 'comprehensive' : 'basic'}`,
      category: 'Code Quality',
      severity: 'medium',
    },

    // Dependency Management
    {
      name: 'Automated Dependencies',
      status: hygiene.dependabot,
      description: 'Dependabot configured for automated dependency updates',
      category: 'Dependency Management',
      severity: 'medium',
      icon: Package,
    },
    {
      name: 'Security Advisories',
      status: hygiene.security_advisories,
      description: 'Security advisories configured for vulnerability tracking',
      category: 'Dependency Management',
      severity: 'high',
      icon: Package,
    },
    {
      name: 'Lock File Present',
      status: hygiene.package_lock,
      description: 'Package lock file ensures reproducible builds',
      category: 'Dependency Management',
      severity: 'high',
      icon: Package,
    },
    {
      name: 'Dependency Freshness',
      status:
        hygiene.outdated_dependencies.count <= 5 &&
        hygiene.outdated_dependencies.critical === 0,
      description: `${hygiene.outdated_dependencies.count} outdated (${hygiene.outdated_dependencies.critical} critical)`,
      category: 'Dependency Management',
      severity: hygiene.outdated_dependencies.critical > 0 ? 'high' : 'medium',
      icon: Package,
    },

    // Release Management
    {
      name: 'Recent Releases',
      status: hygiene.releases_recent,
      description: 'Recent releases or tags indicate active maintenance',
      category: 'Release Management',
      severity: 'medium',
      icon: Tag,
    },
    {
      name: 'Semantic Versioning',
      status: hygiene.semantic_versioning,
      description: 'Follows semantic versioning for predictable releases',
      category: 'Release Management',
      severity: 'medium',
      icon: Tag,
    },
    {
      name: 'Release Notes',
      status: hygiene.release_notes,
      description: 'Release notes document changes for users',
      category: 'Release Management',
      severity: 'low',
      icon: Tag,
    },
    {
      name: 'Git Tags',
      status: hygiene.tags_present,
      description: 'Git tags mark important versions and releases',
      category: 'Release Management',
      severity: 'low',
      icon: Tag,
    },

    // Development Practices
    {
      name: 'Conventional Commits',
      status: hygiene.conventional_commits_rate >= 0.7,
      description: `${Math.round(hygiene.conventional_commits_rate * 100)}% of commits follow conventional format`,
      category: 'Development Practices',
      severity: 'medium',
      icon: Code,
    },
    {
      name: 'PR Size Management',
      status: hygiene.pr_size_check.large_pr_rate <= 0.3,
      description: `Average PR size: ${hygiene.pr_size_check.average_size}, ${Math.round(hygiene.pr_size_check.large_pr_rate * 100)}% large PRs`,
      category: 'Development Practices',
      severity: 'medium',
      icon: Code,
    },
    {
      name: 'Code Review Coverage',
      status: hygiene.review_coverage >= 0.8,
      description: `${Math.round(hygiene.review_coverage * 100)}% of PRs receive reviews`,
      category: 'Development Practices',
      severity: 'high',
      icon: Code,
    },
    {
      name: 'Merge Strategy',
      status: hygiene.merge_strategy.squash_enabled,
      description: `Squash merging: ${hygiene.merge_strategy.squash_enabled ? 'Enabled' : 'Disabled'}`,
      category: 'Development Practices',
      severity: 'low',
      icon: Code,
    },

    // Community Health
    {
      name: 'GitHub Discussions',
      status: hygiene.discussions_enabled,
      description: 'GitHub Discussions enabled for community interaction',
      category: 'Community Health',
      severity: 'low',
      icon: Users,
    },
    {
      name: 'Project Boards',
      status: hygiene.projects_used,
      description: 'GitHub Projects used for task management',
      category: 'Community Health',
      severity: 'low',
      icon: Users,
    },
    {
      name: 'Issue Response Time',
      status: hygiene.issue_response_time.sla_met,
      description: `Average response time: ${hygiene.issue_response_time.average_hours}h (SLA ${hygiene.issue_response_time.sla_met ? 'met' : 'missed'})`,
      category: 'Community Health',
      severity: 'medium',
      icon: Users,
    },
    {
      name: 'Stale Issue Management',
      status: hygiene.stale_issue_management,
      description: 'Automated management of stale issues and PRs',
      category: 'Community Health',
      severity: 'low',
      icon: Users,
    },
  ];

  const getStatusIcon = (status: boolean) => {
    if (status) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = (status: boolean, severity: string) => {
    if (status) {
      return 'bg-green-50 border-green-200';
    }
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Repository Security':
        return Shield;
      case 'Documentation':
        return FileText;
      case 'Code Quality':
        return Code;
      case 'Dependency Management':
        return Package;
      case 'Release Management':
        return Tag;
      case 'Development Practices':
        return Code;
      case 'Community Health':
        return Users;
      default:
        return Info;
    }
  };

  const groupedChecks = checks.reduce(
    (acc, check) => {
      if (!acc[check.category]) {
        acc[check.category] = [];
      }
      acc[check.category].push(check);
      return acc;
    },
    {} as Record<string, typeof checks>
  );

  const passedChecks = checks.filter((check) => check.status).length;
  const totalChecks = checks.length;
  const passPercentage = (passedChecks / totalChecks) * 100;

  const highSeverityFailed = checks.filter(
    (c) => c.severity === 'high' && !c.status
  ).length;
  const mediumSeverityFailed = checks.filter(
    (c) => c.severity === 'medium' && !c.status
  ).length;
  const lowSeverityFailed = checks.filter(
    (c) => c.severity === 'low' && !c.status
  ).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Repository Hygiene & Best Practices ✨
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {passedChecks}/{totalChecks} checks passed (
            {passPercentage.toFixed(1)}%)
          </p>
          <div className="flex items-center space-x-4 mt-2">
            {highSeverityFailed > 0 && (
              <span className="text-xs text-red-600 font-medium">
                {highSeverityFailed} high priority issues
              </span>
            )}
            {mediumSeverityFailed > 0 && (
              <span className="text-xs text-yellow-600 font-medium">
                {mediumSeverityFailed} medium priority issues
              </span>
            )}
            {lowSeverityFailed > 0 && (
              <span className="text-xs text-blue-600 font-medium">
                {lowSeverityFailed} low priority improvements
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                passPercentage >= 85
                  ? 'bg-green-500'
                  : passPercentage >= 70
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${passPercentage}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {passPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedChecks).map(([category, categoryChecks]) => {
          const CategoryIcon = getCategoryIcon(category);
          const categoryPassed = categoryChecks.filter((c) => c.status).length;
          const categoryTotal = categoryChecks.length;
          const categoryPercentage = (categoryPassed / categoryTotal) * 100;

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CategoryIcon className="h-5 w-5 mr-2 text-gray-600" />
                  {category}
                  <span className="ml-2 text-sm text-gray-500">
                    ({categoryPassed}/{categoryTotal})
                  </span>
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        categoryPercentage >= 80
                          ? 'bg-green-500'
                          : categoryPercentage >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${categoryPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {categoryPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {categoryChecks.map((check) => {
                  return (
                    <div
                      key={check.name}
                      className={`p-4 rounded-lg border ${getStatusColor(check.status, check.severity)} transition-all hover:shadow-sm`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(check.status)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {check.name}
                              </h4>
                              {getSeverityBadge(check.severity)}
                            </div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {check.description}
                      </p>
                      {!check.status && check.recommendation && (
                        <p className="text-xs text-blue-600 mt-2 italic">
                          💡 {check.recommendation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {passPercentage < 70 && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Repository Health Improvement Recommended
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p className="mb-2">
                  Your repository scored {passPercentage.toFixed(1)}%. Focus on
                  addressing high-priority issues first:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {highSeverityFailed > 0 && (
                    <li>
                      🔴 {highSeverityFailed} critical security and quality
                      issues
                    </li>
                  )}
                  {mediumSeverityFailed > 0 && (
                    <li>
                      🟡 {mediumSeverityFailed} important best practice
                      improvements
                    </li>
                  )}
                  {lowSeverityFailed > 0 && (
                    <li>
                      🔵 {lowSeverityFailed} minor enhancements for polish
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {passPercentage >= 85 && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Excellent Repository Health! 🎉
              </h3>
              <div className="mt-1 text-sm text-green-700">
                Your repository demonstrates excellent hygiene and development
                practices. Keep up the great work maintaining these high
                standards!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

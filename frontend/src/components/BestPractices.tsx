import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { HygieneChecks } from '../types';

interface BestPracticesProps {
  hygiene: HygieneChecks;
}

export function BestPractices({ hygiene }: BestPracticesProps) {
  const checks = [
    {
      name: 'Branch Protection',
      status: hygiene.branch_protection.present,
      description: `Required reviews: ${hygiene.branch_protection.required_reviews}, Status checks: ${hygiene.branch_protection.status_checks_required ? 'Yes' : 'No'}`,
      category: 'Repository Security'
    },
    {
      name: 'CODEOWNERS',
      status: hygiene.codeowners,
      description: 'File present for code review assignment',
      category: 'Repository Security'
    },
    {
      name: 'CI/CD Present',
      status: hygiene.ci_present,
      description: 'Continuous integration workflows configured',
      category: 'Automation'
    },
    {
      name: 'Issue Templates',
      status: hygiene.issue_templates,
      description: 'Templates for consistent issue reporting',
      category: 'Documentation'
    },
    {
      name: 'PR Template',
      status: hygiene.pr_template,
      description: 'Template for consistent pull request format',
      category: 'Documentation'
    },
    {
      name: 'Contributing Guide',
      status: hygiene.contributing,
      description: 'CONTRIBUTING.md file present',
      category: 'Documentation'
    },
    {
      name: 'Code of Conduct',
      status: hygiene.code_of_conduct,
      description: 'CODE_OF_CONDUCT.md file present',
      category: 'Documentation'
    },
    {
      name: 'Security Policy',
      status: hygiene.security,
      description: 'SECURITY.md file present',
      category: 'Documentation'
    },
    {
      name: 'License',
      status: hygiene.license,
      description: 'License file present',
      category: 'Legal'
    },
    {
      name: 'README Quality',
      status: hygiene.readme_quality.has_setup && hygiene.readme_quality.has_test,
      description: `Setup: ${hygiene.readme_quality.has_setup ? 'Yes' : 'No'}, Test: ${hygiene.readme_quality.has_test ? 'Yes' : 'No'}, Badges: ${hygiene.readme_quality.badges.join(', ') || 'None'}`,
      category: 'Documentation'
    },
    {
      name: 'Pre-commit Hooks',
      status: hygiene.precommit,
      description: 'Pre-commit configuration present',
      category: 'Code Quality'
    },
    {
      name: 'EditorConfig',
      status: hygiene.editorconfig,
      description: '.editorconfig file present',
      category: 'Code Quality'
    },
    {
      name: 'Recent Releases',
      status: hygiene.releases_recent,
      description: 'Recent tags or GitHub releases',
      category: 'Release Management'
    },
    {
      name: 'Conventional Commits',
      status: hygiene.conventional_commits_rate >= 0.7,
      description: `${Math.round(hygiene.conventional_commits_rate * 100)}% of commits follow convention`,
      category: 'Code Quality'
    },
    {
      name: 'Dependabot',
      status: hygiene.dependabot,
      description: 'Automated dependency updates configured',
      category: 'Automation'
    }
  ];

  const getStatusIcon = (status: boolean) => {
    if (status) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, typeof checks>);

  const passedChecks = checks.filter(check => check.status).length;
  const totalChecks = checks.length;
  const passPercentage = (passedChecks / totalChecks) * 100;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Best Practices & Hygiene</h2>
          <p className="text-sm text-gray-600 mt-1">
            {passedChecks}/{totalChecks} checks passed ({passPercentage.toFixed(0)}%)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${passPercentage >= 80 ? 'bg-green-500' : passPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${passPercentage}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {passPercentage.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
          <div key={category}>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              {category}
              <span className="ml-2 text-sm text-gray-500">
                ({categoryChecks.filter(c => c.status).length}/{categoryChecks.length})
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryChecks.map((check) => (
                <div
                  key={check.name}
                  className={`p-4 rounded-lg border ${getStatusColor(check.status)} transition-all hover:shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{check.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{check.description}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {passPercentage < 60 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Improvement Needed</h3>
              <div className="mt-1 text-sm text-yellow-700">
                Consider addressing the failed checks to improve repository hygiene and development practices.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

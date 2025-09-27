import { AlertCircle } from 'lucide-react';
import { Contributor } from '../types';

interface ContributorsTableProps {
  contributors: Contributor[];
}

export function ContributorsTable({ contributors }: ContributorsTableProps) {
  // Calculate total commits for bus factor
  const totalCommits = contributors.reduce((sum, contributor) => sum + contributor.commits, 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Contributors</h2>
          <p className="text-sm text-gray-600 mt-1">
            {contributors.length} active contributors in this period
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PRs Authored
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviews Given
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issues
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Direct Pushes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commit %
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contributors
              .sort((a, b) => b.commits - a.commits)
              .map((contributor) => {
                const commitPercentage = totalCommits > 0 ? (contributor.commits / totalCommits * 100) : 0;
                const isBusFactorRisk = commitPercentage > 70;

                return (
                  <tr key={contributor.login} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {contributor.login}
                        </div>
                        {isBusFactorRisk && (
                          <AlertCircle className="ml-2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contributor.commits}</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(commitPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contributor.prs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contributor.reviews}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contributor.issues}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        contributor.direct_pushes_default > 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {contributor.direct_pushes_default}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        isBusFactorRisk ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {commitPercentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {contributors.some(c => (c.commits / totalCommits * 100) > 70) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Bus Factor Warning</h3>
              <div className="mt-1 text-sm text-red-700">
                One contributor has made more than 70% of commits, creating a potential bus factor risk.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

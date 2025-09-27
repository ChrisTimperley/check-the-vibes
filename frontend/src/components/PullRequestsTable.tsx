import { ExternalLink, Filter } from 'lucide-react';
import { PullRequest } from '../types';
import { formatDate, getStatusColor, getSizeBucketColor, cn } from '../utils';

interface PullRequestsTableProps {
  pullRequests: PullRequest[];
}

export function PullRequestsTable({ pullRequests }: PullRequestsTableProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pull Requests</h2>
          <p className="text-sm text-gray-600 mt-1">
            {pullRequests.length} pull requests in this period
          </p>
        </div>
        <button className="btn-secondary flex items-center space-x-1">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviewed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Linked
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cycle Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pullRequests.map((pr) => (
              <tr key={pr.number} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{pr.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                    {pr.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(pr.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pr.author}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(pr.status))}>
                    {pr.status}
                  </span>
                  {pr.is_draft && (
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      Draft
                    </span>
                  )}
                  {pr.is_wip && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      WIP
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn('px-2 py-1 rounded text-xs font-medium', getSizeBucketColor(pr.size_bucket))}>
                    {pr.size_bucket}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {pr.files_changed} files, +{pr.additions}/-{pr.deletions}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium',
                    pr.reviewed ? 'status-green' : 'status-red')}>
                    {pr.reviewed ? 'Yes' : 'No'}
                  </span>
                  {pr.reviewed && (
                    <div className="text-xs text-gray-500 mt-1">
                      {pr.approvals} approvals
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium',
                    pr.linked_issues.length > 0 ? 'status-green' : 'status-red')}>
                    {pr.linked_issues.length > 0 ? 'Yes' : 'No'}
                  </span>
                  {pr.linked_issues.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {pr.linked_issues.map(issue => `#${issue}`).join(', ')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(pr.ci_status))}>
                    {pr.ci_status === 'none' ? 'N/A' : pr.ci_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pr.cycle_time_hours ? `${pr.cycle_time_hours}h` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

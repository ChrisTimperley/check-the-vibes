import { RefreshCw, Download, Settings } from 'lucide-react';

interface HeaderProps {
  repo: string;
  onRefresh: () => void;
  onExport: () => void;
}

export function Header({ repo, onRefresh, onExport }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Check the Vibes</h1>
          <div className="text-sm text-gray-500">
            Repository:{' '}
            <span className="font-medium text-gray-700">{repo}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Last 14 days</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Custom range</option>
          </select>

          <button
            onClick={onRefresh}
            className="btn-secondary flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>

          <button
            onClick={onExport}
            className="btn-primary flex items-center space-x-1"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>

          <button className="btn-secondary">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

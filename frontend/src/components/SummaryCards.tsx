import { Users, GitPullRequest, AlertTriangle, Clock, CheckCircle, Activity } from 'lucide-react';
import { AnalysisReport } from '../types';

interface SummaryCardsProps {
  data: AnalysisReport;
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const { summary } = data;

  const cards = [
    {
      title: 'Contributors',
      value: summary.contributors_active,
      icon: Users,
      description: 'Active contributors',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'PRs Opened',
      value: summary.prs_opened,
      icon: GitPullRequest,
      description: 'Pull requests opened',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Issues',
      value: `${summary.issues_opened}/${summary.issues_closed}`,
      icon: AlertTriangle,
      description: 'Opened/Closed',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'PRs Reviewed',
      value: `${Math.round(summary.pct_prs_reviewed * 100)}%`,
      icon: CheckCircle,
      description: 'Percentage reviewed',
      color: summary.pct_prs_reviewed >= 0.8 ? 'text-green-600' : summary.pct_prs_reviewed >= 0.6 ? 'text-yellow-600' : 'text-red-600',
      bgColor: summary.pct_prs_reviewed >= 0.8 ? 'bg-green-50' : summary.pct_prs_reviewed >= 0.6 ? 'bg-yellow-50' : 'bg-red-50'
    },
    {
      title: 'Cycle Time',
      value: `${summary.median_pr_cycle_time_hours.toFixed(1)}h`,
      icon: Clock,
      description: 'Median PR cycle time',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Stale Items',
      value: summary.stale_items,
      icon: Activity,
      description: 'Items needing attention',
      color: summary.stale_items > 5 ? 'text-red-600' : summary.stale_items > 2 ? 'text-yellow-600' : 'text-green-600',
      bgColor: summary.stale_items > 5 ? 'bg-red-50' : summary.stale_items > 2 ? 'bg-yellow-50' : 'bg-green-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

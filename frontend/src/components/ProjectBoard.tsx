import { Calendar, User, Tag } from 'lucide-react';
import { ProjectItem } from '../types';
import { formatDate, cn } from '../utils';

interface ProjectBoardProps {
  projectItems: ProjectItem[];
}

export function ProjectBoard({ projectItems }: ProjectBoardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Issue':
        return 'bg-green-100 text-green-800';
      case 'PR':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgeColor = (days: number) => {
    if (days > 14) return 'text-red-600';
    if (days > 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const columns = [...new Set(projectItems.map(item => item.column))].sort();
  const itemsByColumn = columns.reduce((acc, column) => {
    acc[column] = projectItems.filter(item => item.column === column);
    return acc;
  }, {} as Record<string, ProjectItem[]>);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Board</h2>
          <p className="text-sm text-gray-600 mt-1">
            {projectItems.length} items across {columns.length} columns
          </p>
        </div>
      </div>

      {projectItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No project board configured or no items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{column}</h3>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                  {itemsByColumn[column].length}
                </span>
              </div>

              <div className="space-y-3">
                {itemsByColumn[column].map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 flex-1 pr-2">
                        {item.title}
                      </h4>
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getTypeColor(item.type))}>
                        {item.type}
                      </span>
                    </div>

                    {item.labels.length > 0 && (
                      <div className="flex items-center space-x-1 mb-2">
                        <Tag className="h-3 w-3 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {item.labels.slice(0, 2).map((label) => (
                            <span key={label} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              {label}
                            </span>
                          ))}
                          {item.labels.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              +{item.labels.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {item.assignees.length > 0 && (
                      <div className="flex items-center space-x-1 mb-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {item.assignees.slice(0, 2).map((assignee) => (
                            <span key={assignee} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              {assignee}
                            </span>
                          ))}
                          {item.assignees.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              +{item.assignees.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.last_activity)}</span>
                      </div>
                      <span className={cn('font-medium', getAgeColor(item.age_days))}>
                        {item.age_days}d old
                      </span>
                    </div>

                    {item.linked_artifact && (
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        Linked: {item.linked_artifact}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

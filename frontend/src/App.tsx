import { useState } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { ContributorsTable } from './components/ContributorsTable';
import { PullRequestsTable } from './components/PullRequestsTable';
import { IssuesTable } from './components/IssuesTable';
import { ProjectBoard } from './components/ProjectBoard';
import { BestPractices } from './components/BestPractices';
import { mockAnalysisData } from './data/mockData';
import './index.css';

function App() {
  const [data] = useState(mockAnalysisData);

  const handleRefresh = () => {
    console.log('Refreshing data...');
    // In the future, this would fetch new data from the API
  };

  const handleExport = () => {
    console.log('Exporting data...');
    // In the future, this would export data as CSV/PDF
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        repo={data.repo}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <main className="max-w-7xl mx-auto">
        {/* Summary Cards */}
        <SummaryCards data={data} />

        {/* Main Content Sections */}
        <div className="px-6 pb-6 space-y-8">
          {/* Contributors Section */}
          <ContributorsTable contributors={data.contributors} />

          {/* Pull Requests Section */}
          <PullRequestsTable pullRequests={data.pull_requests} />

          {/* Issues Section */}
          <IssuesTable issues={data.issues} />

          {/* Project Board Section */}
          <ProjectBoard projectItems={data.project.items} />

          {/* Best Practices Section */}
          <BestPractices hygiene={data.hygiene} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <div>
            Analysis window: {new Date(data.window.from).toLocaleDateString()} - {new Date(data.window.to).toLocaleDateString()}
          </div>
          <div>
            Overall Score: <span className="font-medium text-gray-700">{data.scores.overall}/100</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

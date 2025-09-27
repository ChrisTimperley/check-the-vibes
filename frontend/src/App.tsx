import { useState } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { ContributorsTable } from './components/ContributorsTable';
import { PullRequestsTable } from './components/PullRequestsTable';
import { IssuesTable } from './components/IssuesTable';
import { ProjectBoard } from './components/ProjectBoard';
import { BestPractices } from './components/BestPractices';
import { mockAnalysisData } from './data/mockData';

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
    <div className="min-h-screen bg-red-500">
      <h1 className="text-4xl font-bold text-white p-8">TAILWIND TEST</h1>
      <div className="bg-blue-500 p-4 m-4">
        <p className="text-white">
          If you see red background and this blue box, Tailwind is working
        </p>
      </div>
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
        <div className="max-w-7xl mx-auto flex items-center justify-center text-sm text-gray-500">
          <div>
            Analysis window: {new Date(data.window.from).toLocaleDateString()} -{' '}
            {new Date(data.window.to).toLocaleDateString()}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

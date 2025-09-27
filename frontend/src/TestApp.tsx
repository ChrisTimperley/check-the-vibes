import { useState } from 'react';
import { mockAnalysisData } from './data/mockData';

function App() {
  const [data] = useState(mockAnalysisData);

  return (
    <div className="min-h-screen bg-red-500">
      <h1 className="text-4xl font-bold text-white p-8">TAILWIND TEST</h1>
      <div className="bg-blue-500 p-4 m-4">
        <p className="text-white">
          If you see red background and this blue box, Tailwind is working
        </p>
      </div>
      <div className="bg-green-400 text-black p-2 m-2 rounded-lg shadow-lg">
        <p>Green box with shadow and rounded corners</p>
      </div>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

const Dashboard = () => {
  const [quotes, setQuotes] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    apiClient.get('/quotes/').then(res => setQuotes(res.data)).catch(console.error);
    apiClient.get('/jobs/').then(res => setJobs(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de Bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Devis Reçus</h2>
          <p className="text-4xl font-bold text-blue-600 mt-2">{quotes.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Candidatures</h2>
          <p className="text-4xl font-bold text-green-600 mt-2">{jobs.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

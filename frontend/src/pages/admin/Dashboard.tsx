import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import {
  FileText,
  Briefcase,
  Eye,
  Users as UsersIcon,
  TrendingUp,
} from 'lucide-react';

interface Summary {
  total_visits: number;
  unique_visitors: number;
  visits_last_7_days: number;
  total_quotes: number;
  unread_quotes: number;
  total_applications: number;
  unread_applications: number;
  daily_visits: { day: string; count: number }[];
  top_pages: { visited_url: string; count: number }[];
}

const Dashboard = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .get<Summary>('/analytics/summary/')
      .then((res) => setSummary(res.data))
      .catch(() => setError('Impossible de charger les statistiques.'));
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!summary) {
    return <div className="text-gray-500">Chargement…</div>;
  }

  const maxDaily = Math.max(...summary.daily_visits.map((d) => d.count), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900">Tableau de Bord</h1>
      <p className="text-sm text-gray-500 mb-6">Vue d'ensemble de l'activité</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Eye className="w-6 h-6 text-blue-600" />}
          label="Visites totales"
          value={summary.total_visits}
          sub={`${summary.visits_last_7_days} sur 7 jours`}
          color="blue"
        />
        <StatCard
          icon={<UsersIcon className="w-6 h-6 text-purple-600" />}
          label="Visiteurs uniques"
          value={summary.unique_visitors}
          sub="IP distinctes"
          color="purple"
        />
        <StatCard
          icon={<FileText className="w-6 h-6 text-green-600" />}
          label="Devis reçus"
          value={summary.total_quotes}
          sub={`${summary.unread_quotes} non lu(s)`}
          color="green"
          highlight={summary.unread_quotes > 0}
        />
        <StatCard
          icon={<Briefcase className="w-6 h-6 text-orange-600" />}
          label="Candidatures"
          value={summary.total_applications}
          sub={`${summary.unread_applications} non lue(s)`}
          color="orange"
          highlight={summary.unread_applications > 0}
        />
      </div>

      {/* Graphique simple : visites sur 7 jours */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Visites des 7 derniers jours
        </h2>
        {summary.daily_visits.length === 0 ? (
          <p className="text-gray-500 text-sm">Pas de données pour la période.</p>
        ) : (
          <div className="flex items-end gap-3 h-48">
            {summary.daily_visits.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="text-xs text-gray-600 mb-1">{d.count}</div>
                <div
                  className="w-full bg-blue-500 rounded-t transition-all"
                  style={{ height: `${(d.count / maxDaily) * 100}%` }}
                  title={`${d.count} visites le ${d.day}`}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(d.day).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top pages */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="font-bold text-lg text-gray-900 mb-4">Pages les plus consultées</h2>
        <ul className="space-y-2">
          {summary.top_pages.map((p) => (
            <li
              key={p.visited_url}
              className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded"
            >
              <span className="text-gray-700 font-mono text-sm">{p.visited_url}</span>
              <span className="text-blue-600 font-semibold">{p.count}</span>
            </li>
          ))}
          {summary.top_pages.length === 0 && (
            <li className="text-gray-500 text-sm">Aucune visite enregistrée.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  highlight?: boolean;
}

const StatCard = ({ icon, label, value, sub, color, highlight }: StatCardProps) => {
  const bgMap = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
  };
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm border ${
        highlight ? 'border-orange-300' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-md ${bgMap[color]}`}>{icon}</div>
        {highlight && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
            À traiter
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
};

export default Dashboard;

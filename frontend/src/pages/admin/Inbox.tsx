import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Eye, FileText, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface ItemBase {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
  read_at: string | null;
  read_by_user: { id?: number; name?: string; masked?: boolean } | null;
}

interface Quote extends ItemBase {
  client_type: 'B2B' | 'B2C';
  surface_m2: number | null;
  documents?: { id: number; file: string }[];
}

interface JobApp extends ItemBase {
  cv_file: string | null;
}

type Selected =
  | (Quote & { type: 'quote' })
  | (JobApp & { type: 'job' })
  | null;

const Inbox = () => {
  const { isSuperAdmin } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<JobApp[]>([]);
  const [activeTab, setActiveTab] = useState<'quotes' | 'jobs'>('quotes');
  const [selectedItem, setSelectedItem] = useState<Selected>(null);

  const fetchQuotes = () => {
    apiClient.get<Quote[]>('/quotes/').then((res) => setQuotes(res.data)).catch(console.error);
  };
  const fetchJobs = () => {
    apiClient.get<JobApp[]>('/jobs/').then((res) => setJobs(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchQuotes();
    fetchJobs();
  }, []);

  const markAsRead = async (id: number, type: 'quote' | 'job') => {
    const endpoint = type === 'quote' ? `/quotes/${id}/read/` : `/jobs/${id}/read/`;
    try {
      await apiClient.patch(endpoint);
      if (type === 'quote') fetchQuotes();
      else fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = (item: Quote | JobApp, type: 'quote' | 'job') => {
    setSelectedItem({ ...item, type } as Selected);
    if (!item.read_by_user) {
      markAsRead(item.id, type);
    }
  };

  const getFileUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  const renderReadBy = (item: ItemBase) => {
    if (!item.read_by_user) return null;
    // Tâche 5.2 : "Lu par" visible UNIQUEMENT par le Super Admin
    if (!isSuperAdmin || item.read_by_user.masked) {
      return (
        <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          <Lock className="h-4 w-4 mr-2" />
          Déjà traité
        </div>
      );
    }
    return (
      <div className="flex items-center text-sm text-gray-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
        <Eye className="h-4 w-4 mr-2 text-purple-600" />
        Lu par <span className="font-semibold ml-1">{item.read_by_user.name}</span>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/3 border-r bg-white overflow-y-auto flex flex-col">
        <div className="p-4 border-b bg-gray-50 flex gap-2">
          <button
            onClick={() => {
              setActiveTab('quotes');
              setSelectedItem(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'quotes'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Devis ({quotes.filter((q) => !q.read_by_user).length} non lus)
          </button>
          <button
            onClick={() => {
              setActiveTab('jobs');
              setSelectedItem(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Candidatures ({jobs.filter((j) => !j.read_by_user).length} non lus)
          </button>
        </div>

        <ul className="divide-y divide-gray-200 overflow-y-auto">
          {activeTab === 'quotes' ? (
            quotes.length === 0 ? (
              <li className="p-4 text-center text-gray-500">Aucun devis reçu</li>
            ) : (
              quotes.map((quote) => (
                <li
                  key={quote.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedItem?.id === quote.id && selectedItem?.type === 'quote'
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  } ${!quote.read_by_user ? 'font-bold bg-gray-50' : ''}`}
                  onClick={() => handleItemClick(quote, 'quote')}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm text-gray-500">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </span>
                    {!quote.read_by_user ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Nouveau
                      </span>
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-gray-900 truncate">
                    {quote.first_name} {quote.last_name}
                  </p>
                  <p className="text-sm text-blue-600 truncate">{quote.client_type}</p>
                </li>
              ))
            )
          ) : jobs.length === 0 ? (
            <li className="p-4 text-center text-gray-500">Aucune candidature reçue</li>
          ) : (
            jobs.map((job) => (
              <li
                key={job.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedItem?.id === job.id && selectedItem?.type === 'job'
                    ? 'bg-blue-50 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                } ${!job.read_by_user ? 'font-bold bg-gray-50' : ''}`}
                onClick={() => handleItemClick(job, 'job')}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm text-gray-500">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  {!job.read_by_user ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Nouveau
                    </span>
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-gray-900 truncate">
                  {job.first_name} {job.last_name}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="w-2/3 bg-gray-50 p-8 overflow-y-auto">
        {selectedItem ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-start border-b pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedItem.first_name} {selectedItem.last_name}
                </h2>
                <p className="text-gray-500 mt-1">
                  Reçu le {new Date(selectedItem.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">{renderReadBy(selectedItem)}</div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Contact</h3>
                <p className="text-gray-900">{selectedItem.email}</p>
                <p className="text-gray-900">{selectedItem.phone}</p>
              </div>

              {selectedItem.type === 'quote' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Détails de la demande</h3>
                  <p className="text-gray-900">
                    Type : <span className="font-semibold">{selectedItem.client_type}</span>
                  </p>
                  {selectedItem.surface_m2 != null && (
                    <p className="text-gray-900">Surface : {selectedItem.surface_m2} m²</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Message complet</h3>
              <div className="bg-gray-50 p-4 rounded-md text-gray-800 whitespace-pre-wrap border border-gray-100">
                {selectedItem.message}
              </div>
            </div>

            {((selectedItem.type === 'job' && selectedItem.cv_file) ||
              (selectedItem.type === 'quote' &&
                selectedItem.documents &&
                selectedItem.documents.length > 0)) && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  {selectedItem.type === 'job' ? 'Pièce jointe (CV)' : 'Documents joints'}
                </h3>

                {selectedItem.type === 'job' && selectedItem.cv_file && (
                  <div className="text-center p-8 bg-gray-50 rounded-md border border-gray-200">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <a
                      href={getFileUrl(selectedItem.cv_file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Ouvrir le CV
                    </a>
                  </div>
                )}

                {selectedItem.type === 'quote' &&
                  selectedItem.documents &&
                  selectedItem.documents.map((doc, index) => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 rounded-md p-4 bg-white mb-4"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Document {index + 1}</span>
                        <a
                          href={getFileUrl(doc.file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4 mr-2 text-blue-600" />
                          Ouvrir
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <FileText className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-lg">Sélectionnez un élément dans la liste pour voir les détails</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;

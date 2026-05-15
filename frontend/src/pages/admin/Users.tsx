import { useEffect, useState } from 'react';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  is_active: boolean;
  created_at: string;
}

/**
 * Tâche 5.5 — Gestion des Administrateurs.
 * Accessible uniquement au Super Admin (Loyde).
 */
const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = () => {
    apiClient
      .get<AdminUser[]>('/users/')
      .then((res) => setUsers(res.data))
      .catch(() => setError('Impossible de charger les administrateurs.'));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setShowForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/users/', {
        name,
        email,
        password,
        role: 'admin',
      });
      setSuccess(`Administrateur ${name} créé.`);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      const msg =
        err.response?.data?.email ||
        err.response?.data?.password ||
        err.response?.data?.detail ||
        'Erreur lors de la création.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Supprimer définitivement le compte de "${name}" ?`)) return;
    try {
      await apiClient.delete(`/users/${id}/`);
      setSuccess(`Compte ${name} supprimé.`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Suppression impossible.');
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Administrateurs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Réservé au Super Admin — créer / supprimer des comptes "Admin"
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          {showForm ? 'Fermer' : 'Nouvel Admin'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="font-bold text-lg mb-4 flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
            Créer un compte Admin
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe (6 caractères min)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Création…' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé le</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id} className={u.id === currentUser?.id ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {u.name}
                  {u.id === currentUser?.id && (
                    <span className="ml-2 text-xs text-blue-600">(vous)</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'super_admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {u.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {u.role !== 'super_admin' && u.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Aucun administrateur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;

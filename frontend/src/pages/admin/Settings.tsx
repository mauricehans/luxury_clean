import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Save } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    apiClient.get('/settings/')
      .then(res => setSettings(res.data))
      .catch(err => {
        console.error(err);
        if (err.response?.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          // Redirect to login if token is invalid
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2000);
        }
      });
  };

  const handleUpdate = async (key_name: string, value: string) => {
    setError('');
    setSuccessMsg('');
    try {
      await apiClient.put(`/settings/${key_name}/`, { key_name, value });
      setSuccessMsg('Paramètre mis à jour avec succès !');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      } else {
        setError('Erreur lors de la mise à jour.');
      }
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Paramètres Généraux</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-green-700">{successMsg}</p>
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-8">
        {settings.map(setting => (
          <div key={setting.key_name} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {setting.key_name.replace(/_/g, ' ')}
            </label>
            <div className="flex mt-1">
              {setting.key_name === 'address_map_link' ? (
                <textarea 
                  defaultValue={setting.value} 
                  className="flex-1 border border-gray-300 p-3 rounded-l-md focus:ring-blue-500 focus:border-blue-500" 
                  id={`input-${setting.key_name}`}
                  rows={4}
                />
              ) : (
                <input 
                  type="text" 
                  defaultValue={setting.value} 
                  className="flex-1 border border-gray-300 p-3 rounded-l-md focus:ring-blue-500 focus:border-blue-500" 
                  id={`input-${setting.key_name}`} 
                />
              )}
              <button 
                onClick={() => {
                  const val = (document.getElementById(`input-${setting.key_name}`) as HTMLInputElement | HTMLTextAreaElement).value;
                  handleUpdate(setting.key_name, val);
                }} 
                className="bg-blue-600 text-white px-6 py-3 rounded-r-md hover:bg-blue-700 flex items-center transition-colors font-medium h-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {setting.key_name === 'whatsapp_number' && "Ce numéro s'affichera sur la page de demande de devis et contact."}
              {setting.key_name === 'contact_email' && "Cette adresse recevra les notifications et s'affichera sur la page contact."}
              {setting.key_name.includes('address_street') && "Nom et numéro de la rue."}
              {setting.key_name.includes('address_zipcode') && "Code postal."}
              {setting.key_name.includes('address_city') && "Nom de la ville."}
              {setting.key_name === 'address_map_link' && "IMPORTANT : Pour Google Maps, allez sur Google Maps > Partager > 'Intégrer une carte' > Copiez uniquement le lien contenu dans le src=\"...\""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;

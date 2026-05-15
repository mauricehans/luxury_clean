import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../api/client';
import { Calculator, Clock, ShieldCheck, ThumbsUp, UploadCloud } from 'lucide-react';

/**
 * Tâche 4.4 — Formulaire de Devis unifié B2B/B2C
 * Validation des champs avec React Hook Form + Zod.
 */

const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

const quoteSchema = z.object({
  client_type: z.enum(['B2B', 'B2C']),
  first_name: z.string().min(2, 'Le prénom doit faire au moins 2 caractères.'),
  last_name: z.string().min(2, 'Le nom doit faire au moins 2 caractères.'),
  email: z.string().email('Adresse email invalide.'),
  phone: z
    .string()
    .regex(phoneRegex, 'Numéro de téléphone invalide. Exemple : 0612345678'),
  surface_m2: z
    .string()
    .optional()
    .refine(
      (v) => !v || (!isNaN(Number(v.replace(',', '.'))) && Number(v.replace(',', '.')) >= 0),
      'Surface invalide.'
    ),
  message: z.string().min(10, 'Veuillez décrire votre besoin (10 caractères minimum).'),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

const Quote = () => {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('06.14.75.93.08');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { client_type: 'B2B' },
  });

  useEffect(() => {
    apiClient
      .get('/settings/')
      .then((res) => {
        const w = res.data.find((s: any) => s.key_name === 'whatsapp_number');
        if (w) setPhoneNumber(w.value);
      })
      .catch(() => undefined);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };
  const removeFile = (index: number) =>
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (data: QuoteFormData) => {
    setServerError('');
    const fd = new FormData();
    fd.append('client_type', data.client_type);
    fd.append('first_name', data.first_name);
    fd.append('last_name', data.last_name);
    fd.append('email', data.email);
    fd.append('phone', data.phone);
    fd.append('message', data.message);
    if (data.surface_m2) {
      fd.append('surface_m2', data.surface_m2.replace(',', '.'));
    }
    selectedFiles.forEach((f) => fd.append('documents', f));
    try {
      await apiClient.post('/quotes/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
    } catch {
      setServerError("Une erreur est survenue lors de l'envoi.");
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 text-green-600 mb-8">
          <ThumbsUp className="h-10 w-10" />
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
          Demande envoyée avec succès
        </h2>
        <p className="text-xl text-gray-600">
          Notre équipe vous recontactera dans les plus brefs délais.
        </p>
      </div>
    );
  }

  const inputBase = 'w-full border p-3 rounded-md focus:ring-blue-500 focus:border-blue-500';
  const inputCls = (hasError?: boolean) =>
    `${inputBase} ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Obtenir un devis personnalisé
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Remplissez ce formulaire pour une proposition sur-mesure, sans engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
              Vos informations
            </h2>

            {serverError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vous êtes *
                </label>
                <select {...register('client_type')} className={`${inputBase} bg-white`}>
                  <option value="B2B">Une entreprise / Un professionnel (B2B)</option>
                  <option value="B2C">Un particulier (B2C)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    {...register('first_name')}
                    className={inputCls(!!errors.first_name)}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    {...register('last_name')}
                    className={inputCls(!!errors.last_name)}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    {...register('email')}
                    className={inputCls(!!errors.email)}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className={inputCls(!!errors.phone)}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surface estimée (en m²) — Optionnel
                </label>
                <input
                  type="text"
                  {...register('surface_m2')}
                  className={inputCls(!!errors.surface_m2)}
                  placeholder="Ex : 150 ou 150,5"
                />
                {errors.surface_m2 && (
                  <p className="mt-1 text-sm text-red-600">{errors.surface_m2.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message / Détails *
                </label>
                <textarea
                  rows={5}
                  {...register('message')}
                  placeholder="Décrivez votre besoin : type de locaux, fréquence..."
                  className={inputCls(!!errors.message)}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documents complémentaires (optionnel)
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                >
                  <div className="space-y-1 text-center w-full">
                    <UploadCloud
                      className={`mx-auto h-12 w-12 ${
                        dragActive ? 'text-blue-500' : 'text-gray-400'
                      }`}
                    />
                    <div className="text-sm text-blue-600 mt-2">
                      Cliquez ou glissez vos fichiers ici
                    </div>
                    <p className="text-xs text-gray-500">PDF, Word ou Images</p>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                      }
                    }}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200 text-sm"
                      >
                        <span className="truncate text-gray-700 max-w-[80%]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 font-bold ml-4"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-4 px-4 rounded-md shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
              >
                {isSubmitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-900 text-white p-8 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-4 border-b border-blue-700 pb-4">
                Pourquoi nous choisir ?
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <Calculator className="h-6 w-6 text-blue-300 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Devis clair</h4>
                    <p className="text-blue-100 text-sm mt-1">Tarifs transparents, sans frais cachés.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Clock className="h-6 w-6 text-blue-300 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Réactivité</h4>
                    <p className="text-blue-100 text-sm mt-1">Réponse sous 24 à 48h.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-6 w-6 text-blue-300 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Visite préalable</h4>
                    <p className="text-blue-100 text-sm mt-1">Nous nous déplaçons sur site.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Besoin d'aide ?</h3>
              <p className="text-gray-600 mb-4">Préférez-vous nous appeler ?</p>
              <div className="text-blue-600 font-bold text-xl">{phoneNumber}</div>
              <div className="text-gray-500 text-sm mt-2">
                Du lundi au vendredi, 8h-18h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quote;

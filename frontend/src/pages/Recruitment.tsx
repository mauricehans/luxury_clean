import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../api/client';
import { Briefcase, Star, HeartHandshake, MapPin, UploadCloud } from 'lucide-react';

const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const recruitmentSchema = z.object({
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z
    .string()
    .regex(phoneRegex, 'Numéro de téléphone invalide. Exemple: 0612345678'),
  message: z
    .string()
    .min(10, 'Merci de détailler votre message (10 caractères minimum)'),
});

type RecruitmentFormValues = z.infer<typeof recruitmentSchema>;

const Recruitment = () => {
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecruitmentFormValues>({
    resolver: zodResolver(recruitmentSchema),
  });

  const validateFile = (file: File | null): boolean => {
    if (!file) {
      setFileError('Le CV est obligatoire');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Le fichier ne doit pas dépasser 5 Mo');
      return false;
    }
    if (!ACCEPTED_MIME.includes(file.type) && !/\.(pdf|docx?)$/i.test(file.name)) {
      setFileError('Format non supporté (PDF, DOC, DOCX uniquement)');
      return false;
    }
    setFileError('');
    return true;
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
      validateFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) validateFile(file);
  };

  const triggerFileSelect = () => {
    inputRef.current?.click();
  };

  const onSubmit = async (values: RecruitmentFormValues) => {
    setSubmitError('');
    if (!validateFile(selectedFile)) return;

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (selectedFile) {
      formData.append('cv_file', selectedFile);
    }

    try {
      await apiClient.post('/jobs/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      reset();
      setSelectedFile(null);
    } catch {
      setSubmitError("Erreur lors de l'envoi de la candidature. Réessayez plus tard.");
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Candidature envoyée !</h2>
        <p className="text-gray-600">
          Merci de votre intérêt. Nous étudierons votre profil avec attention et vous
          recontacterons très prochainement.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Rejoindre L'équipe Luxclean
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Vous devez être bref et mettre en avant ce que vous pourriez nous apporter. Vos
            expériences passées, motivations et disponibilités. Un maximum de détails nous
            permettra de conserver votre candidature et de vous recevoir à nos prochaines
            sessions de recrutement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info Section */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Pourquoi vous ?</h3>
              </div>
              <p className="text-gray-600">
                Si vous êtes véhiculé, avez de l'expérience et des références dans le
                nettoyage, votre candidature sera bien placée. Mais ce n'est pas essentiel !
                Nous formons en interne : avec de bonnes motivations et l'envie de rejoindre
                notre équipe, vous possédez un atout non négligeable.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <Briefcase className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">L'entreprise Luxclean</h3>
              </div>
              <p className="text-gray-600">
                Luxclean Services est une société de taille humaine. Nous mettons l'accent
                sur la qualité de nos prestations, la rigueur et la ponctualité de nos
                agents. Rejoindre notre équipe, c'est se former et trouver une direction à
                l'écoute.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <HeartHandshake className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Nos Valeurs & Motivations</h3>
              </div>
              <p className="text-gray-600">
                Nous demandons le respect de nos clients et une grande motivation. En
                retour, nous sommes conciliants : un rendez-vous, un problème personnel, un
                besoin de repos ? Nous ferons tout notre possible pour vous libérer.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Nos Secteurs</h3>
              </div>
              <p className="text-gray-600">
                Nous intervenons dans les bureaux, résidences, cabinets médicaux, écoles,
                crèches, ainsi que pour des remises en état après chantier. Nous travaillons
                principalement avec des professionnels sur notre région.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white p-8 rounded-xl shadow-md h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
              Laissez-nous votre candidature
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votre prénom *
                  </label>
                  <input
                    type="text"
                    {...register('first_name')}
                    className={`w-full border p-3 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.first_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votre nom *
                  </label>
                  <input
                    type="text"
                    {...register('last_name')}
                    className={`w-full border p-3 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.last_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votre e-mail *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full border p-3 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votre téléphone *
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className={`w-full border p-3 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Votre message, motivations, disponibilités... *
                </label>
                <textarea
                  {...register('message')}
                  rows={5}
                  className={`w-full border p-3 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Déposez votre CV (PDF, DOC) *
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : fileError
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                >
                  <div className="space-y-1 text-center">
                    <UploadCloud
                      className={`mx-auto h-12 w-12 ${
                        dragActive ? 'text-blue-500' : 'text-gray-400'
                      }`}
                    />
                    <div className="flex text-sm text-gray-600 justify-center mt-2">
                      <span className="relative font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        {selectedFile
                          ? selectedFile.name
                          : 'Cliquez ou glissez un fichier ici'}
                        <input
                          ref={inputRef}
                          id="file-upload"
                          name="cv_file"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </span>
                    </div>
                    {!selectedFile && (
                      <p className="text-xs text-gray-500">PDF ou Word jusqu'à 5MB</p>
                    )}
                  </div>
                </div>
                {fileError && <p className="mt-1 text-sm text-red-600">{fileError}</p>}
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recruitment;

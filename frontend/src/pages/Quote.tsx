import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/client';
import { Calculator, Clock, ShieldCheck, ThumbsUp, UploadCloud } from 'lucide-react';

const Quote = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('06.14.75.93.08'); // Default fallback
  
  // Validation States
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [surfaceError, setSurfaceError] = useState('');

  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch the phone number from settings
    apiClient.get('/settings/')
      .then(res => {
        const whatsappSetting = res.data.find((s: any) => s.key_name === 'whatsapp_number');
        if (whatsappSetting) {
          setPhoneNumber(whatsappSetting.value);
        }
      })
      .catch(console.error);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    setFileError('');
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      if (selectedFiles.length + newFiles.length > 8) {
        setFileError('Vous ne pouvez pas ajouter plus de 8 documents.');
        // Only add up to the limit of 8
        const allowedToAdd = 8 - selectedFiles.length;
        if (allowedToAdd > 0) {
          setSelectedFiles(prev => [...prev, ...newFiles.slice(0, allowedToAdd)]);
        }
      } else {
        setSelectedFiles(prev => [...prev, ...newFiles]);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleFiles(e.target.files);
    // Reset the input value so the same file can be selected again if it was removed
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileSelect = () => {
    inputRef.current?.click();
  };

  const validatePhone = (phone: string) => {
    // Allows standard french formats like: 0612345678, 06 12 34 56 78, +33612345678, 06.12.34.56.78
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Numéro de téléphone invalide. Exemple: 0612345678');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Adresse email invalide.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const formatSurface = (value: string) => {
    // Replace comma with dot for proper float parsing
    let formatted = value.replace(',', '.');
    
    // Check if it's a valid number
    if (isNaN(Number(formatted)) || formatted.trim() === '') {
      setSurfaceError('Veuillez entrer un nombre valide.');
      return null;
    }

    // Prevent multiple dots
    const dotsCount = (formatted.match(/\./g) || []).length;
    if (dotsCount > 1) {
      setSurfaceError('La surface ne peut contenir qu\'une seule virgule ou point.');
      return null;
    }
    
    if (Number(formatted) < 0) {
      setSurfaceError('La surface ne peut pas être négative.');
      return null;
    }

    setSurfaceError('');
    return formatted;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    
    // Validations
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const surface = formData.get('surface_m2') as string;

    const isPhoneValid = validatePhone(phone);
    const isEmailValid = validateEmail(email);
    let formattedSurface = null;

    if (surface) {
      formattedSurface = formatSurface(surface);
      if (formattedSurface === null) return; // Validation failed
      formData.set('surface_m2', formattedSurface);
    }

    if (!isPhoneValid || !isEmailValid) {
      return; // Stop submission
    }
    
    if (selectedFiles.length > 8) {
      setFileError('Vous ne pouvez pas envoyer plus de 8 documents.');
      return;
    }
    
    // Handle multiple files
    selectedFiles.forEach((file) => {
      formData.append('documents', file);
    });
    
    try {
      await apiClient.post('/quotes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
    } catch (err) {
      setError('Une erreur est survenue lors de l\'envoi du devis.');
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 text-green-600 mb-8">
          <ThumbsUp className="h-10 w-10" />
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Demande envoyée avec succès !</h2>
        <p className="text-xl text-gray-600">
          Merci pour votre confiance. Notre équipe commerciale va étudier votre demande et vous recontactera dans les plus brefs délais.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Obtenir un devis personnalisé</h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Chaque espace est unique. Remplissez ce formulaire pour nous aider à comprendre vos besoins et nous vous proposerons une solution sur-mesure, transparente et sans engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Form Section */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Vos informations</h2>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vous êtes *</label>
                <select name="client_type" required className="w-full border border-gray-300 p-3 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option value="B2B">Une entreprise / Un professionnel (B2B)</option>
                  <option value="B2C">Un particulier (B2C)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input type="text" name="first_name" required className="w-full border border-gray-300 p-3 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" name="last_name" required className="w-full border border-gray-300 p-3 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    onChange={(e) => { if(emailError) validateEmail(e.target.value) }}
                    onBlur={(e) => validateEmail(e.target.value)}
                    className={`w-full border p-3 rounded-md focus:ring-blue-500 focus:border-blue-500 ${emailError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                  />
                  {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    onChange={(e) => { if(phoneError) validatePhone(e.target.value) }}
                    onBlur={(e) => validatePhone(e.target.value)}
                    className={`w-full border p-3 rounded-md focus:ring-blue-500 focus:border-blue-500 ${phoneError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                  />
                  {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surface estimée (en m²) - Optionnel</label>
                <input 
                  type="text" 
                  name="surface_m2" 
                  onChange={(e) => { if(surfaceError) formatSurface(e.target.value) }}
                  onBlur={(e) => { if(e.target.value) formatSurface(e.target.value) }}
                  className={`w-full border p-3 rounded-md focus:ring-blue-500 focus:border-blue-500 ${surfaceError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
                  placeholder="Ex: 150 ou 150.5 ou 150,5" 
                />
                {surfaceError && <p className="mt-1 text-sm text-red-600">{surfaceError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message / Détails de la demande *</label>
                <textarea name="message" rows={5} required placeholder="Décrivez votre besoin : type de locaux, fréquence d'intervention souhaitée, prestations spécifiques..." className="w-full border border-gray-300 p-3 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documents complémentaires (Plans, photos...) - Optionnel</label>
                <div 
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                >
                  <div className="space-y-1 text-center w-full">
                    <UploadCloud className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <div className="flex text-sm text-gray-600 justify-center mt-2">
                      <span className="relative font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        Cliquez ou glissez vos fichiers ici
                        <input 
                          ref={inputRef}
                          id="file-upload-quote" 
                          name="documents" 
                          type="file" 
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                          className="sr-only" 
                          onChange={handleChange}
                        />
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">PDF, Word ou Images jusqu'à 5MB par fichier (Maximum 8 documents)</p>
                  </div>
                </div>
                
                {fileError && <p className="mt-2 text-sm text-red-600 font-medium">{fileError}</p>}
                
                {/* File list preview */}
                {selectedFiles.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                        <span className="truncate text-gray-700 max-w-[80%]">{file.name}</span>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                          className="text-red-500 hover:text-red-700 font-bold ml-4"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button type="submit" className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300">
                Envoyer ma demande de devis
              </button>
            </form>
          </div>

          {/* Sidebar Info Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-900 text-white p-8 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-4 border-b border-blue-700 pb-4">Pourquoi nous choisir ?</h3>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <Calculator className="h-6 w-6 text-blue-300 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Devis clair et détaillé</h4>
                    <p className="text-blue-100 text-sm mt-1">Nos tarifs sont transparents, sans frais cachés.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Clock className="h-6 w-6 text-blue-300 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Réactivité</h4>
                    <p className="text-blue-100 text-sm mt-1">Une réponse sous 24 à 48 heures ouvrées maximum.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="h-6 w-6 text-blue-300 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Visite préalable</h4>
                    <p className="text-blue-100 text-sm mt-1">Nous nous déplaçons sur site pour évaluer vos besoins précis.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Besoin d'aide ?</h3>
              <p className="text-gray-600 mb-4">Vous préférez nous expliquer votre besoin de vive voix ?</p>
              <div className="text-blue-600 font-bold text-xl">
                {phoneNumber}
              </div>
              <div className="text-gray-500 text-sm mt-2">
                Du lundi au vendredi<br />De 8h00 à 18h00
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Quote;

import React, { useState, useRef } from 'react';
import { apiClient } from '../api/client';
import { Briefcase, Star, HeartHandshake, MapPin, UploadCloud } from 'lucide-react';

const Recruitment = () => {
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validation States
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validatePhone = (phone: string) => {
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    inputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Validations
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;

    const isPhoneValid = validatePhone(phone);
    const isEmailValid = validateEmail(email);

    if (!isPhoneValid || !isEmailValid) {
      return; // Stop submission
    }

    // Ensure the file is appended if it was dragged & dropped
    if (selectedFile) {
      formData.set('cv_file', selectedFile);
    }

    try {
      await apiClient.post('/jobs/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
    } catch (err) {
      alert('Erreur lors de l\'envoi de la candidature');
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Candidature envoyée !</h2>
        <p className="text-gray-600">Merci de votre intérêt. Nous étudierons votre profil avec attention et vous recontacterons très prochainement.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Rejoindre L'équipe Luxclean</h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Vous devez être bref et mettre en avant ce que vous pourriez nous apporter. Vos expériences passées, motivations et disponibilités. Un maximum de détails nous permettra de conserver votre candidature et de vous recevoir à nos prochaines sessions de recrutement.
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
                Si vous êtes véhiculé, avez de l'expérience et des références dans le nettoyage, votre candidature sera bien placée. Mais ce n'est pas essentiel ! Nous formons en interne : avec de bonnes motivations et l'envie de rejoindre notre équipe, vous possédez un atout non négligeable.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <Briefcase className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">L'entreprise Luxclean</h3>
              </div>
              <p className="text-gray-600">
                Luxclean Services est une société de taille humaine. Nous mettons l'accent sur la qualité de nos prestations, la rigueur et la ponctualité de nos agents. Rejoindre notre équipe, c'est se former et trouver une direction à l'écoute.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <HeartHandshake className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Nos Valeurs & Motivations</h3>
              </div>
              <p className="text-gray-600">
                Nous demandons le respect de nos clients et une grande motivation. En retour, nous sommes conciliants : un rendez-vous, un problème personnel, un besoin de repos ? Nous ferons tout notre possible pour vous libérer.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Nos Secteurs</h3>
              </div>
              <p className="text-gray-600">
                Nous intervenons dans les bureaux, résidences, cabinets médicaux, écoles, crèches, ainsi que pour des remises en état après chantier. Nous travaillons principalement avec des professionnels sur notre région.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white p-8 rounded-xl shadow-md h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Laissez-nous votre candidature</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Votre prénom *</label>
                  <input type="text" name="first_name" required className="w-full border border-gray-300 p-3 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom *</label>
                  <input type="text" name="last_name" required className="w-full border border-gray-300 p-3 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Votre e-mail *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Votre téléphone *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Votre message, motivations, disponibilités... *</label>
                <textarea name="message" required rows={5} className="w-full border border-gray-300 p-3 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Déposez votre CV (PDF, DOC) *</label>
                <div 
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                >
                  <div className="space-y-1 text-center">
                    <UploadCloud className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <div className="flex text-sm text-gray-600 justify-center mt-2">
                      <span className="relative font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        {selectedFile ? selectedFile.name : "Cliquez ou glissez un fichier ici"}
                        <input 
                          ref={inputRef}
                          id="file-upload" 
                          name="cv_file" 
                          type="file" 
                          accept=".pdf,.doc,.docx" 
                          className="sr-only" 
                          onChange={handleChange}
                        />
                      </span>
                    </div>
                    {!selectedFile && <p className="text-xs text-gray-500">PDF ou Word jusqu'à 5MB</p>}
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 shadow-md">
                Envoyer ma candidature
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recruitment;

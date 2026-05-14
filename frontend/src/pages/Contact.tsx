import React, { useEffect, useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin, ExternalLink } from 'lucide-react';
import { apiClient } from '../api/client';

const Contact = () => {
  const [email, setEmail] = useState('contact@luxclean.fr');
  const [phone, setPhone] = useState('06.14.75.93.08');
  const [addressStreet, setAddressStreet] = useState('16bis Avenue Aristide Briand');
  const [addressZipcode, setAddressZipcode] = useState('34170');
  const [addressCity, setAddressCity] = useState('Castelnau-le-Lez');
  const [mapLink, setMapLink] = useState('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.163353459141!2d3.902264515496738!3d43.62396347912185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12b6af1275eb1bc3%3A0xc3f5c760d62a343b!2s16%20Avenue%20Aristide%20Briand%2C%2034170%20Castelnau-le-Lez!5e0!3m2!1sfr!2sfr!4v1689178923485!5m2!1sfr!2sfr');

  useEffect(() => {
    // Récupérer les paramètres depuis la base de données
    apiClient.get('/settings/')
      .then(res => {
        const emailSetting = res.data.find((s: any) => s.key_name === 'contact_email');
        const phoneSetting = res.data.find((s: any) => s.key_name === 'whatsapp_number');
        const streetSetting = res.data.find((s: any) => s.key_name === 'address_street');
        const zipSetting = res.data.find((s: any) => s.key_name === 'address_zipcode');
        const citySetting = res.data.find((s: any) => s.key_name === 'address_city');
        const mapSetting = res.data.find((s: any) => s.key_name === 'address_map_link');
        
        if (emailSetting) setEmail(emailSetting.value);
        if (phoneSetting) setPhone(phoneSetting.value);
        if (streetSetting) setAddressStreet(streetSetting.value);
        if (zipSetting) setAddressZipcode(zipSetting.value);
        if (citySetting) setAddressCity(citySetting.value);
        if (mapSetting) setMapLink(mapSetting.value);
      })
      .catch(console.error);
  }, []);

  // Formatage du numéro pour les liens (ex: tel: ou wa.me)
  const formatPhoneForLink = (phoneNumber: string) => {
    return phoneNumber.replace(/[^0-9+]/g, '');
  };

  const formatWhatsApp = (phoneNumber: string) => {
    let clean = formatPhoneForLink(phoneNumber);
    // Si le numéro commence par un 0 (format local français), on le passe en format international +33
    if (clean.startsWith('0')) {
      clean = '33' + clean.substring(1);
    }
    // Retirer le + s'il existe pour l'URL wa.me
    return clean.replace('+', '');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Contact</h2>
          <h1 className="mt-2 text-4xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Restons en contact
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Une question ? Un besoin spécifique ? N'hésitez pas à nous contacter via le canal de votre choix. Notre équipe est à votre disposition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* Option: Appel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition-shadow">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-6">
              <Phone className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Par Téléphone</h3>
            <p className="text-gray-500 mb-6 h-12">
              Pour une réponse immédiate de vive voix (du lundi au vendredi, de 8h à 18h).
            </p>
            <p className="text-lg font-bold text-gray-900 mb-6">{phone}</p>
            <a 
              href={`tel:${formatPhoneForLink(phone)}`}
              className="inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Appeler maintenant
            </a>
          </div>

          {/* Option: WhatsApp */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition-shadow">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Via WhatsApp</h3>
            <p className="text-gray-500 mb-6 h-12">
              Envoyez-nous un message direct, des photos ou une demande rapide.
            </p>
            <p className="text-lg font-bold text-gray-900 mb-6">{phone}</p>
            <a 
              href={`https://wa.me/${formatWhatsApp(phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Ouvrir WhatsApp <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>

          {/* Option: Email */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-6">
              <Mail className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Par E-mail</h3>
            <p className="text-gray-500 mb-6 h-12">
              Pour des demandes plus détaillées ou l'envoi de documents complémentaires.
            </p>
            <p className="text-sm font-bold text-gray-900 mb-6 break-all">{email}</p>
            <a 
              href={`mailto:${email}`}
              className="inline-flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Envoyer un e-mail
            </a>
          </div>

        </div>

        {/* Section Informations Complémentaires & Map */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center">
            <div className="flex items-start mb-8">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full mt-1">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Notre Siège Social</h4>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {addressStreet}<br/>
                  {addressZipcode} {addressCity}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-8 mt-auto">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Demande d'intervention</h4>
              <p className="text-gray-500 mb-4">
                Vous souhaitez une évaluation chiffrée précise ? Utilisez notre formulaire détaillé.
              </p>
              <a 
                href="/devis"
                className="inline-flex items-center font-medium text-blue-600 hover:text-blue-700"
              >
                Aller au formulaire de devis <span className="ml-2">&rarr;</span>
              </a>
            </div>
          </div>

          {/* Map iframe */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 h-[400px] lg:h-auto overflow-hidden">
            {mapLink && mapLink.includes('embed') ? (
              <iframe 
                src={mapLink} 
                width="100%" 
                height="100%" 
                style={{ border: 0, borderRadius: '12px' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Carte de localisation"
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl text-center p-6 border-2 border-dashed border-gray-200">
                <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  La carte ne peut pas être affichée car le lien fourni n'est pas un lien d'intégration (embed) Google Maps.
                </p>
                {mapLink && (
                  <a 
                    href={mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Ouvrir la carte dans un nouvel onglet
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
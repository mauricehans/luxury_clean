import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sparkles, MapPin, Mail, Phone, Menu, X } from 'lucide-react';
import { apiClient } from '../api/client';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [email, setEmail] = useState('contact@luxclean.fr');
  const [phone, setPhone] = useState('06.14.75.93.08');
  const [addressStreet, setAddressStreet] = useState('16bis Avenue Aristide Briand');
  const [addressZipcode, setAddressZipcode] = useState('34170');
  const [addressCity, setAddressCity] = useState('Castelnau-le-Lez');

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    // Récupérer les paramètres depuis la base de données pour le footer
    apiClient.get('/settings/')
      .then(res => {
        const emailSetting = res.data.find((s: any) => s.key_name === 'contact_email');
        const phoneSetting = res.data.find((s: any) => s.key_name === 'whatsapp_number');
        const streetSetting = res.data.find((s: any) => s.key_name === 'address_street');
        const zipSetting = res.data.find((s: any) => s.key_name === 'address_zipcode');
        const citySetting = res.data.find((s: any) => s.key_name === 'address_city');
        
        if (emailSetting) setEmail(emailSetting.value);
        if (phoneSetting) setPhone(phoneSetting.value);
        if (streetSetting) setAddressStreet(streetSetting.value);
        if (zipSetting) setAddressZipcode(zipSetting.value);
        if (citySetting) setAddressCity(citySetting.value);
      })
      .catch(console.error);
  }, []);

  const currentYear = new Date().getFullYear();
  
  // Format the phone number for WhatsApp API (remove spaces, dots, and convert leading 0 to 33 for France)
  const getWhatsAppLink = (phoneNumber: string) => {
    let cleaned = phoneNumber.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '33' + cleaned.substring(1);
    } else if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <img src="/logo.jpeg" alt="Luxclean Services Logo" className="h-16 w-auto mix-blend-multiply" />
              </Link>
              {/* Desktop Navigation */}
              <div className="hidden lg:ml-8 lg:flex lg:space-x-8 items-center">
                <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-bold text-brand-blue hover:text-brand-green transition-colors">Accueil</Link>
                <Link to="/services" className="inline-flex items-center px-1 pt-1 text-sm font-bold text-brand-blue hover:text-brand-green transition-colors">Services</Link>
                <Link to="/portfolio" className="inline-flex items-center px-1 pt-1 text-sm font-bold text-brand-blue hover:text-brand-green transition-colors">Réalisations</Link>
                <Link to="/actualites" className="inline-flex items-center px-1 pt-1 text-sm font-bold text-brand-blue hover:text-brand-green transition-colors">Actualités</Link>
                <Link to="/recrutement" className="inline-flex items-center px-1 pt-1 text-sm font-bold text-brand-blue hover:text-brand-green transition-colors">Recrutement</Link>
                <Link to="/contact" className="inline-flex items-center px-1 pt-1 text-sm font-bold text-brand-blue hover:text-brand-green transition-colors">Contact</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <Link to="/devis" className="bg-brand-green text-white px-6 py-2.5 rounded-md text-sm font-bold hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap">
                  Demander un devis
                </Link>
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue"
                  aria-expanded="false"
                >
                  <span className="sr-only">Ouvrir le menu principal</span>
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="pt-2 pb-4 space-y-1">
              <Link to="/" className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-brand-green">Accueil</Link>
              <Link to="/services" className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-brand-green">Services</Link>
              <Link to="/portfolio" className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-brand-green">Réalisations</Link>
              <Link to="/actualites" className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-brand-green">Actualités</Link>
              <Link to="/recrutement" className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-brand-green">Recrutement</Link>
              <Link to="/contact" className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-brand-green">Contact</Link>
              <div className="pl-3 pr-4 py-3 sm:hidden">
                <Link to="/devis" className="block w-full text-center bg-brand-green text-white px-6 py-3 rounded-md text-base font-bold hover:bg-green-700 transition-colors shadow-sm">
                  Demander un devis
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12 border-t-4 border-brand-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-center sm:text-left">
            
            {/* Colonne 1 : Adresse */}
            <div className="flex flex-col items-center sm:items-start">
              <MapPin className="h-8 w-8 text-brand-green mb-4" />
              <p className="leading-relaxed">
                {addressStreet}<br />
                {addressZipcode} {addressCity}<br />
                (Siège Social)
              </p>
            </div>

            {/* Colonne 2 : Email */}
            <div className="flex flex-col items-center sm:items-start">
              <Mail className="h-8 w-8 text-brand-green mb-4" />
              <a href={`mailto:${email}`} className="hover:text-white transition-colors break-all">
                {email}
              </a>
            </div>

            {/* Colonne 3 : Téléphone */}
            <div className="flex flex-col items-center sm:items-start">
              <Phone className="h-8 w-8 text-brand-green mb-4" />
              <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors text-lg font-bold">
                {phone}
              </a>
            </div>

            {/* Colonne 4 : Copyright & Liens utiles */}
            <div className="flex flex-col items-center sm:items-start bg-gray-800 p-6 rounded-lg lg:-mt-6 lg:mb-0 mb-6">
              <div className="flex items-center mb-4">
                <img src="/logo.jpeg" alt="Luxclean Services Logo" className="h-10 w-auto mix-blend-lighten opacity-80" />
              </div>
              <p className="text-sm text-gray-400 mb-4">
                La propreté qui inspire confiance.
              </p>
              <div className="text-xs text-gray-500 mt-auto">
                <p className="mb-1">&copy; {currentYear} Luxclean Services.</p>
                <p>Tous droits réservés.</p>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={getWhatsAppLink(phone)}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20bd5a] hover:scale-110 transition-all z-50 flex items-center justify-center group"
        aria-label="Contactez-nous sur WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="absolute right-full mr-4 bg-gray-800 text-white text-sm py-1 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Discutons ensemble
        </span>
      </a>
    </div>
  );
};

export default MainLayout;

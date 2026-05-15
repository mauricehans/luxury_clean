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
    </div>
  );
};

export default MainLayout;

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Leaf, Users, Sparkles, CheckCircle2 } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-brand-blue">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block mb-2">LA PROPRETÉ QUI</span>
              <span className="block text-brand-green">INSPIRE CONFIANCE</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-lg text-blue-100 sm:max-w-3xl italic">
              "Le succès des entreprises ne repose pas sur les épaules d'un seul individu, mais bien sur l'ensemble de l'équipe."
            </p>
            <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
              <div className="rounded-md shadow">
                <Link to="/devis" className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-brand-green hover:bg-green-700 md:text-lg transition duration-300">
                  Demander un devis
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link to="/services" className="w-full flex items-center justify-center px-8 py-4 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-brand-blue md:text-lg transition duration-300">
                  Découvrir nos services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valeurs Section */}
      <div className="py-20 bg-brand-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-brand-blue uppercase tracking-wide">Des valeurs fortes et durables</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Un modèle fondé sur la rigueur, la proximité et la responsabilité
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 text-brand-blue mb-6">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-brand-blue mb-2">Exigence & Fiabilité</h3>
              <p className="text-gray-500 text-sm">Des prestations strictement chiffrées, planifiées et un suivi rigulier garantissant la bonne exécution.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 text-brand-green mb-6">
                <Leaf className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-brand-blue mb-2">Développement Durable</h3>
              <p className="text-gray-500 text-sm">Une démarche écoresponsable, réduction des consommations et choix de produits adaptés.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 text-brand-blue mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-brand-blue mb-2">Travail en équipe</h3>
              <p className="text-gray-500 text-sm">Partage, cohésion et souci de l'autre constituent notre raison d'être au quotidien.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 text-brand-blue mb-6">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-brand-blue mb-2">Amélioration Continue</h3>
              <p className="text-gray-500 text-sm">Une dynamique tournée vers l'optimisation des performances et la qualité de service.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagements Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-blue mb-6">Notre démarche qualité</h2>
              <p className="text-lg text-gray-600 mb-8">
                Chez Luxclean Services, la qualité des prestations repose avant tout sur la compétence et l’engagement de nos équipes.
              </p>
              <ul className="space-y-4">
                {[
                  "Évaluation préalable et objective de vos besoins",
                  "Devis clairs, gratuits et rapides",
                  "Des équipes réactives et disponibles",
                  "Contrôle qualité et suivi rigoureux des prestations",
                  "Sécurité et prévention des risques professionnels"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-brand-green mr-3 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-12 lg:mt-0 relative">
              <div className="absolute inset-0 bg-brand-gray rounded-3xl transform translate-x-4 translate-y-4"></div>
              <img 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Équipe de nettoyage professionnelle" 
                className="relative rounded-3xl shadow-xl object-cover h-[500px] w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

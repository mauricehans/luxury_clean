import React from 'react';
import { Building2, Home, Sparkles, Sprout, ShieldAlert, Wrench } from 'lucide-react';

const Services = () => (
  <div className="bg-gray-50 min-h-screen py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Savoir-faire</h2>
        <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Luxclean Services au quotidien
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          Nous intervenons chaque jour pour l'entretien et la mise en propreté de vos locaux, sur la base d'une organisation rigoureuse et structurée.
        </p>
      </div>

      <div className="space-y-16">
        {/* Entretien Courant */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">Entretien courant des locaux</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <Building2 className="h-10 w-10 text-blue-600 mb-4" />
              <h4 className="text-xl font-bold text-gray-900 mb-2">Nettoyage B2B</h4>
              <p className="text-gray-600">Nettoyage des bureaux, locaux professionnels, centres d'affaires et commerces.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <Home className="h-10 w-10 text-blue-600 mb-4" />
              <h4 className="text-xl font-bold text-gray-900 mb-2">Parties communes</h4>
              <p className="text-gray-600">Entretien des parties communes d'immeubles et de résidences pour le confort des résidents.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <Sprout className="h-10 w-10 text-blue-600 mb-4" />
              <h4 className="text-xl font-bold text-gray-900 mb-2">Espaces extérieurs</h4>
              <p className="text-gray-600">Nettoyage des cours, allées, parkings, garages et zones de circulation.</p>
            </div>
          </div>
        </div>

        {/* Interventions Spécifiques */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">Interventions spécifiques</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Nettoyage de vitres</h4>
                <p className="text-gray-600">Intervention sur vitres à faible et grande hauteur.</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Remise en état</h4>
                <p className="text-gray-600">Après travaux, fin de chantier, ou nettoyage avant/après déménagement.</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Traitement des sols</h4>
                <p className="text-gray-600">Remise en état des revêtements : carrelage, parquet, moquette, marbre, sols plastiques.</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShieldAlert className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Milieux sensibles</h4>
                <p className="text-gray-600">Protocoles spécifiques pour la santé (laboratoires, maisons de retraite) et l'éducatif.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Services;

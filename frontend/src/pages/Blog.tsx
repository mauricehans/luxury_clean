import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Calendar, Image as ImageIcon } from 'lucide-react';

const Blog = () => {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/portfolio/')
      .then(res => {
        setPortfolios(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getFileUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Chargement de nos réalisations...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Portfolio</h2>
          <h1 className="mt-2 text-4xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Nos Réalisations
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Découvrez nos interventions sur le terrain. La qualité de notre travail en images.
          </p>
        </div>

        {portfolios.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Aucune réalisation n'a été publiée pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {portfolios.map(portfolio => (
              <div key={portfolio.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                
                {/* Images Section Avant/Après */}
                {(portfolio.image_before || portfolio.image_after) && (
                  <div className="flex h-64 sm:h-80 bg-gray-100">
                    {portfolio.image_before ? (
                      <div className="flex-1 relative border-r-2 border-white">
                        <img 
                          src={getFileUrl(portfolio.image_before)} 
                          alt={`Avant - ${portfolio.title}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                          Avant
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center border-r-2 border-white bg-gray-200 text-gray-400">
                        Pas d'image avant
                      </div>
                    )}
                    
                    {portfolio.image_after ? (
                      <div className="flex-1 relative">
                        <img 
                          src={getFileUrl(portfolio.image_after)} 
                          alt={`Après - ${portfolio.title}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                          Après ✨
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center bg-gray-200 text-gray-400">
                        Pas d'image après
                      </div>
                    )}
                  </div>
                )}

                {/* Content Section */}
                <div className="p-8">
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(portfolio.published_at).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{portfolio.title}</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {portfolio.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Calendar, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const PortfolioDetail = () => {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);

  useEffect(() => {
    apiClient.get(`/portfolio/${id}/`)
      .then(res => {
        setPortfolio(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Auto-play for the image pairs carousel
  useEffect(() => {
    if (!portfolio) return;
    
    const pairs = portfolio.image_pairs && portfolio.image_pairs.length > 0 
      ? portfolio.image_pairs 
      : (portfolio.image_before || portfolio.image_after ? [portfolio] : []);
      
    if (pairs.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentPairIndex(prev => (prev + 1) % pairs.length);
    }, 4000); // Change image pair every 4 seconds

    return () => clearInterval(timer);
  }, [portfolio]);

  const getFileUrl = (url: string) => {
    if (!url) return '';
    // Fix potential double http prefix bug or URL encoding issues
    let cleanUrl = url;
    if (cleanUrl.startsWith('http://localhost:8000/media/http%3A/localhost%3A8000/media/')) {
        cleanUrl = cleanUrl.replace('http://localhost:8000/media/http%3A/localhost%3A8000/media/', '');
    }
    if (cleanUrl.startsWith('http://localhost:8000/media/http')) {
      cleanUrl = cleanUrl.replace('http://localhost:8000/media/', '');
    }
    if (cleanUrl.startsWith('http')) return cleanUrl;
    return `http://localhost:8000${cleanUrl}`;
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Chargement...</div>;
  if (!portfolio) return <div className="text-center py-20 text-gray-500">Réalisation introuvable.</div>;

  const pairs = portfolio.image_pairs && portfolio.image_pairs.length > 0 
    ? portfolio.image_pairs 
    : (portfolio.image_before || portfolio.image_after ? [portfolio] : []);

  const currentPair = pairs[currentPairIndex];

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/portfolio" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux réalisations
        </Link>
        
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {pairs.length > 0 && currentPair && (
            <div className="relative group">
              <div className="flex flex-col md:flex-row h-auto md:h-[500px] bg-gray-100 transition-opacity duration-500 ease-in-out">
                {currentPair.image_before ? (
                  <div className="flex-1 relative border-b-2 md:border-b-0 md:border-r-2 border-white h-64 md:h-full">
                    <img 
                      src={getFileUrl(currentPair.image_before)} 
                      alt={`Avant - ${portfolio.title}`} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      {currentPair.image_after ? 'Avant' : 'Aperçu'}
                    </div>
                  </div>
                ) : null}
                
                {currentPair.image_after ? (
                  <div className="flex-1 relative h-64 md:h-full">
                    <img 
                      src={getFileUrl(currentPair.image_after)} 
                      alt={`Après - ${portfolio.title}`} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                      Après ✨
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Navigation Arrows */}
              {pairs.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPairIndex(prev => (prev === 0 ? pairs.length - 1 : prev - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPairIndex(prev => (prev + 1) % pairs.length);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {pairs.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPairIndex(idx);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-colors shadow-sm ${
                          idx === currentPairIndex ? 'bg-blue-600' : 'bg-white/60 hover:bg-white/90'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Calendar className="h-5 w-5 mr-2" />
              {new Date(portfolio.published_at).toLocaleDateString('fr-FR', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{portfolio.title}</h1>
            <div className="prose prose-lg max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
              {portfolio.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetail;

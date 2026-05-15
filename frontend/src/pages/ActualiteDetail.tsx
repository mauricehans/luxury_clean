import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Calendar, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const ActualiteDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/posts/${id}/`)
      .then(res => {
        setPost(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const getFileUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Chargement...</div>;
  if (!post) return <div className="text-center py-20 text-gray-500">Article introuvable.</div>;

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/actualites" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux actualités
        </Link>
        
        {post.image ? (
          <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-sm">
            <img src={getFileUrl(post.image)} alt={post.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-64 rounded-2xl bg-blue-50 flex items-center justify-center mb-8">
            <ImageIcon className="h-16 w-16 text-blue-200" />
          </div>
        )}

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar className="h-5 w-5 mr-2" />
          {new Date(post.published_at).toLocaleDateString('fr-FR', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          })}
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
          {post.title}
        </h1>

        <div className="prose prose-lg prose-blue max-w-none text-gray-700 whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
    </div>
  );
};

export default ActualiteDetail;

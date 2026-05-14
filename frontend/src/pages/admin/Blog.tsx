import React, { useEffect, useState, useRef } from 'react';
import { apiClient } from '../../api/client';
import { Plus, Trash2, Image as ImageIcon, Briefcase } from 'lucide-react';

const AdminBlog = () => {
  const [activeTab, setActiveTab] = useState<'blog' | 'portfolio'>('blog');
  
  // Data states
  const [posts, setPosts] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  
  // Common Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Blog specific
  const [image, setImage] = useState<File | null>(null);
  
  // Portfolio specific
  const [imageBefore, setImageBefore] = useState<File | null>(null);
  const [imageAfter, setImageAfter] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'blog') {
      fetchPosts();
    } else {
      fetchPortfolios();
    }
  }, [activeTab]);

  const fetchPosts = () => {
    apiClient.get('/posts/')
      .then(res => setPosts(res.data))
      .catch(console.error);
  };

  const fetchPortfolios = () => {
    apiClient.get('/portfolio/')
      .then(res => setPortfolios(res.data))
      .catch(console.error);
  };

  const getFileUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet élément ?')) {
      try {
        if (activeTab === 'blog') {
          await apiClient.delete(`/posts/${id}/`);
          fetchPosts();
        } else {
          await apiClient.delete(`/portfolio/${id}/`);
          fetchPortfolios();
        }
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('slug', title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now());
    
    if (activeTab === 'blog') {
      formData.append('content', content);
      if (image) formData.append('image', image);
    } else {
      formData.append('description', content);
      if (imageBefore) formData.append('image_before', imageBefore);
      if (imageAfter) formData.append('image_after', imageAfter);
    }

    try {
      const endpoint = activeTab === 'blog' ? '/posts/' : '/portfolio/';
      await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowForm(false);
      setTitle('');
      setContent('');
      setImage(null);
      setImageBefore(null);
      setImageAfter(null);
      
      if (activeTab === 'blog') fetchPosts();
      else fetchPortfolios();
      
    } catch (err: any) {
      console.error(err);
      setError('Erreur lors de la création.');
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion du Contenu</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          {showForm ? 'Fermer' : `Nouveau ${activeTab === 'blog' ? 'Article' : 'Portfolio'}`}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => { setActiveTab('blog'); setShowForm(false); }}
          className={`pb-4 px-4 font-medium text-sm flex items-center ${activeTab === 'blog' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Blog (Actualités)
        </button>
        <button
          onClick={() => { setActiveTab('portfolio'); setShowForm(false); }}
          className={`pb-4 px-4 font-medium text-sm flex items-center ${activeTab === 'portfolio' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Portfolio (Réalisations Avant/Après)
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-bold mb-4">
            {activeTab === 'blog' ? 'Ajouter un article de blog' : 'Ajouter une réalisation (Portfolio)'}
          </h2>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input 
                type="text" 
                required 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                placeholder={activeTab === 'blog' ? "Titre de l'article" : "Titre de l'intervention"}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {activeTab === 'blog' ? 'Contenu de l\'article' : 'Description'}
              </label>
              <textarea 
                required 
                rows={6}
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={activeTab === 'blog' ? "Écrivez votre article ici..." : "Expliquez ce qui a été fait..."}
              ></textarea>
            </div>

            {activeTab === 'blog' ? (
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image de l'article</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded"
                >
                  <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-blue-600">
                    {image ? image.name : 'Sélectionner une image'}
                  </span>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => e.target.files && setImage(e.target.files[0])}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image "Avant"</label>
                  <div 
                    onClick={() => fileInputBeforeRef.current?.click()}
                    className="cursor-pointer flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded"
                  >
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-blue-600">
                      {imageBefore ? imageBefore.name : 'Sélectionner une image'}
                    </span>
                    <input 
                      ref={fileInputBeforeRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={e => e.target.files && setImageBefore(e.target.files[0])}
                    />
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image "Après"</label>
                  <div 
                    onClick={() => fileInputAfterRef.current?.click()}
                    className="cursor-pointer flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded"
                  >
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-blue-600">
                      {imageAfter ? imageAfter.name : 'Sélectionner une image'}
                    </span>
                    <input 
                      ref={fileInputAfterRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={e => e.target.files && setImageAfter(e.target.files[0])}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium">
                Publier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeTab === 'blog' ? (
          posts.length === 0 ? (
            <p className="text-gray-500 col-span-2">Aucun article de blog publié.</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {post.image && (
                  <img src={getFileUrl(post.image)} alt={post.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{post.title}</h3>
                    <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{new Date(post.published_at).toLocaleDateString()}</p>
                  <p className="text-gray-600 text-sm line-clamp-3">{post.content}</p>
                </div>
              </div>
            ))
          )
        ) : (
          portfolios.length === 0 ? (
            <p className="text-gray-500 col-span-2">Aucune réalisation publiée.</p>
          ) : (
            portfolios.map(portfolio => (
              <div key={portfolio.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{portfolio.title}</h3>
                    <p className="text-xs text-gray-500">{new Date(portfolio.published_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete(portfolio.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{portfolio.description}</p>
                  {(portfolio.image_before || portfolio.image_after) && (
                    <div className="flex gap-2 h-32">
                      {portfolio.image_before && (
                        <div className="flex-1 relative">
                          <span className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1 rounded">Avant</span>
                          <img src={getFileUrl(portfolio.image_before)} alt="Avant" className="w-full h-full object-cover rounded" />
                        </div>
                      )}
                      {portfolio.image_after && (
                        <div className="flex-1 relative">
                          <span className="absolute top-1 left-1 bg-blue-600/80 text-white text-xs px-1 rounded">Après</span>
                          <img src={getFileUrl(portfolio.image_after)} alt="Après" className="w-full h-full object-cover rounded" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

import { FileText } from 'lucide-react';
export default AdminBlog;
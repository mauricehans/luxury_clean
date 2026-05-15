import React, { useEffect, useState, useRef } from 'react';
import { apiClient } from '../../api/client';
import { Plus, Trash2, Image as ImageIcon, Briefcase, FileText, Edit2, X } from 'lucide-react';

const AdminBlog = () => {
  const [activeTab, setActiveTab] = useState<'blog' | 'portfolio'>('blog');
  
  // Data states
  const [posts, setPosts] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  
  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);

  // Common Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Blog specific
  const [image, setImage] = useState<File | null>(null);
  
  // Portfolio specific
  const [imagePairs, setImagePairs] = useState<{before: File | null, after: File | null, existingId?: number, existingBeforeUrl?: string, existingAfterUrl?: string}[]>([{before: null, after: null}]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(activeTab === 'blog' ? item.content : item.description);
    setImage(null);
    
    if (activeTab === 'portfolio') {
      if (item.image_pairs && item.image_pairs.length > 0) {
        setImagePairs(item.image_pairs.map((pair: any) => ({
          before: null,
          after: null,
          existingId: pair.id,
          existingBeforeUrl: pair.image_before,
          existingAfterUrl: pair.image_after
        })));
      } else {
        // Fallback for legacy data
        setImagePairs([{
          before: null, 
          after: null,
          existingBeforeUrl: item.image_before,
          existingAfterUrl: item.image_after
        }]);
      }
    } else {
      setImagePairs([{before: null, after: null}]);
    }
    
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setImage(null);
    setImagePairs([{before: null, after: null}]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    
    // Only generate slug on creation, or let the backend handle it. We will append if it's new
    if (!editingId) {
      formData.append('slug', title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now());
    }
    
    if (activeTab === 'blog') {
      formData.append('content', content);
      if (image) formData.append('image', image);
    } else {
      formData.append('description', content);
      
      // Pass information about existing pairs that we want to keep
      const existingPairsToKeep = imagePairs
        .map(p => {
          if (!p.existingId && !p.existingBeforeUrl && !p.existingAfterUrl) {
             return null;
          }
          // Clean URLs before sending back to server
          let bUrl = p.existingBeforeUrl || '';
          let aUrl = p.existingAfterUrl || '';
          
          if (bUrl.startsWith('http://localhost:8000/media/')) {
            bUrl = bUrl.replace('http://localhost:8000/media/', '');
          } else if (bUrl.startsWith('/media/')) {
            bUrl = bUrl.replace('/media/', '');
          }
          
          if (aUrl.startsWith('http://localhost:8000/media/')) {
            aUrl = aUrl.replace('http://localhost:8000/media/', '');
          } else if (aUrl.startsWith('/media/')) {
            aUrl = aUrl.replace('/media/', '');
          }
          
          return {
            id: p.existingId,
            before: bUrl,
            after: aUrl
          };
        });
      formData.append('existing_pairs', JSON.stringify(existingPairsToKeep));

      // Append new files
      imagePairs.forEach((pair, index) => {
        // Only append new files if they are actually selected, do not send empty strings for empty inputs
        if (pair.before instanceof File) formData.append(`image_before_${index}`, pair.before);
        if (pair.after instanceof File) formData.append(`image_after_${index}`, pair.after);
        
        // Always append a marker so the backend knows a pair was submitted at this index, even if empty
        if (!pair.existingId && !pair.existingBeforeUrl && !pair.existingAfterUrl) {
            formData.append(`image_before_${index}_marker`, 'true');
        }
      });
    }

    try {
      const endpoint = activeTab === 'blog' ? '/posts/' : '/portfolio/';
      
      if (editingId) {
        await apiClient.patch(`${endpoint}${editingId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await apiClient.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      resetForm();
      
      if (activeTab === 'blog') fetchPosts();
      else fetchPortfolios();
      
    } catch (err: any) {
      console.error(err);
      setError('Erreur lors de l\'enregistrement.');
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion du Contenu</h1>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className={`${showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-md flex items-center`}
        >
          {showForm ? (
            <>
              <X className="w-5 h-5 mr-2" /> Annuler
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Nouveau {activeTab === 'blog' ? 'Article' : 'Portfolio'}
            </>
          )}
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
            {editingId ? (
              activeTab === 'blog' ? 'Modifier l\'article de blog' : 'Modifier la réalisation (Portfolio)'
            ) : (
              activeTab === 'blog' ? 'Ajouter un article de blog' : 'Ajouter une réalisation (Portfolio)'
            )}
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
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Paires d'images (Avant / Après)</label>
                  <button 
                    type="button" 
                    onClick={() => setImagePairs([...imagePairs, {before: null, after: null}])}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Ajouter une paire
                  </button>
                </div>
                
                {imagePairs.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                    <p className="text-gray-500 mb-4">Aucune image pour le moment.</p>
                    <button 
                      type="button" 
                      onClick={() => setImagePairs([{before: null, after: null}])}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 font-medium"
                    >
                      Ajouter ma première paire d'images
                    </button>
                  </div>
                ) : (
                  imagePairs.map((pair, index) => (
                    <div key={pair.existingId || index} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-gray-200 rounded-md bg-gray-50 relative">
                      <button 
                          type="button"
                          onClick={async () => {
                            if (window.confirm("Êtes-vous sûr de vouloir supprimer cette paire d'images ? Cette action est irréversible.")) {
                              const newPairs = [...imagePairs];
                              const pairToDelete = newPairs[index];
                              newPairs.splice(index, 1);
                              
                              const updatedPairs = newPairs.length === 0 ? [{before: null, after: null}] : newPairs;
                              setImagePairs(updatedPairs);
                              
                              // If we are editing an existing portfolio, immediately save changes to the backend
                              if (editingId) {
                                try {
                                  const formData = new FormData();
                                  formData.append('title', title);
                                  formData.append('description', content);
                                  
                                  const existingPairsToKeep = updatedPairs
                                     .map(p => {
                                       if (!p.existingId && !p.existingBeforeUrl && !p.existingAfterUrl) {
                                          return null;
                                       }
                                       // Clean URLs before sending back to server
                                       let bUrl = p.existingBeforeUrl || '';
                                       let aUrl = p.existingAfterUrl || '';
                                       
                                       if (bUrl.startsWith('http://localhost:8000/media/')) {
                                         bUrl = bUrl.replace('http://localhost:8000/media/', '');
                                       } else if (bUrl.startsWith('/media/')) {
                                         bUrl = bUrl.replace('/media/', '');
                                       }
                                       
                                       if (aUrl.startsWith('http://localhost:8000/media/')) {
                                         aUrl = aUrl.replace('http://localhost:8000/media/', '');
                                       } else if (aUrl.startsWith('/media/')) {
                                         aUrl = aUrl.replace('/media/', '');
                                       }
                                       
                                       return {
                                         id: p.existingId,
                                         before: bUrl,
                                         after: aUrl
                                       };
                                     });
                                  formData.append('existing_pairs', JSON.stringify(existingPairsToKeep));

                                  updatedPairs.forEach((pair, idx) => {
                                    if (pair.before instanceof File) formData.append(`image_before_${idx}`, pair.before);
                                    if (pair.after instanceof File) formData.append(`image_after_${idx}`, pair.after);
                                    if (!pair.existingId && !pair.existingBeforeUrl && !pair.existingAfterUrl) {
                                        formData.append(`image_before_${idx}_marker`, 'true');
                                    }
                                  });

                                  await apiClient.patch(`/portfolio/${editingId}/`, formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                  });
                                  
                                  fetchPortfolios();
                                   // The fetchPortfolios doesn't update our local form state immediately.
                                   // Since we deleted an item, we should just fetch the updated portfolio 
                                   // and update our form state to match the DB
                                   apiClient.get(`/portfolio/${editingId}/`).then(res => {
                                      const item = res.data;
                                      if (item.image_pairs && item.image_pairs.length > 0) {
                                        setImagePairs(item.image_pairs.map((pair: any) => ({
                                          before: null,
                                          after: null,
                                          existingId: pair.id,
                                          existingBeforeUrl: pair.image_before,
                                          existingAfterUrl: pair.image_after
                                        })));
                                      } else {
                                        setImagePairs([{before: null, after: null}]);
                                      }
                                   });
                                 } catch (err) {
                                  console.error("Erreur lors de la suppression en base de données", err);
                                  alert("La paire a été retirée de l'affichage mais une erreur est survenue lors de la sauvegarde.");
                                }
                              }
                            }
                          }}
                          className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 z-10"
                          title="Supprimer cette paire d'images"
                        >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center bg-white">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image "Avant" {index + 1}</label>
                        <label className="cursor-pointer flex flex-col items-center justify-center p-4 hover:bg-gray-50 rounded h-full">
                          {pair.before ? (
                            <img src={URL.createObjectURL(pair.before)} alt="Preview Avant" className="h-32 object-cover rounded mb-2" />
                          ) : pair.existingBeforeUrl ? (
                            <img src={getFileUrl(pair.existingBeforeUrl)} alt="Preview Avant" className="h-32 object-cover rounded mb-2" />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                          )}
                          <span className="text-sm text-blue-600 truncate max-w-[200px]">
                            {pair.before ? pair.before.name : (pair.existingBeforeUrl ? pair.existingBeforeUrl.split('/').pop() : 'Sélectionner une image')}
                          </span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={e => {
                              if (e.target.files && e.target.files.length > 0) {
                                const newPairs = [...imagePairs];
                                newPairs[index].before = e.target.files[0];
                                setImagePairs(newPairs);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center bg-white h-48 flex flex-col justify-center relative">
                        <label className="block text-sm font-medium text-gray-700 absolute top-2 left-0 right-0">Image "Après" {index + 1}</label>
                        <label className="cursor-pointer flex flex-col items-center justify-center p-4 hover:bg-gray-50 rounded h-full mt-4">
                          {pair.after ? (
                            <img src={URL.createObjectURL(pair.after)} alt="Preview Après" className="h-24 object-cover rounded mb-2" />
                          ) : pair.existingAfterUrl ? (
                            <img src={getFileUrl(pair.existingAfterUrl)} alt="Preview Après" className="h-24 object-cover rounded mb-2" />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                          )}
                          <span className="text-sm text-blue-600 truncate max-w-[200px]">
                            {pair.after ? pair.after.name : (pair.existingAfterUrl ? pair.existingAfterUrl.split('/').pop() : 'Sélectionner une image')}
                          </span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={e => {
                              if (e.target.files && e.target.files.length > 0) {
                                const newPairs = [...imagePairs];
                                newPairs[index].after = e.target.files[0];
                                setImagePairs(newPairs);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 font-medium mr-4">
                Annuler
              </button>
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium">
                {editingId ? 'Mettre à jour' : 'Publier'}
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
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(post)} className="text-blue-500 hover:text-blue-700">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
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
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(portfolio)} className="text-blue-500 hover:text-blue-700">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(portfolio.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{portfolio.description}</p>
                  
                  {/* Display pairs preview */}
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {portfolio.image_pairs && portfolio.image_pairs.length > 0 ? (
                      portfolio.image_pairs.map((pair: any, idx: number) => (
                        <div key={pair.id || idx} className="flex gap-1 h-24 flex-shrink-0 border border-gray-200 p-1 rounded">
                          {pair.image_before && (
                            <div className="relative w-24">
                              <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">Av.</span>
                              <img src={getFileUrl(pair.image_before)} alt="Avant" className="w-full h-full object-cover rounded" />
                            </div>
                          )}
                          {pair.image_after && (
                            <div className="relative w-24">
                              <span className="absolute top-1 left-1 bg-blue-600/80 text-white text-[10px] px-1 rounded">Ap.</span>
                              <img src={getFileUrl(pair.image_after)} alt="Après" className="w-full h-full object-cover rounded" />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      /* Fallback for legacy data */
                      (portfolio.image_before || portfolio.image_after) && (
                        <div className="flex gap-1 h-24 flex-shrink-0 border border-gray-200 p-1 rounded">
                          {portfolio.image_before && (
                            <div className="relative w-24">
                              <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">Av.</span>
                              <img src={getFileUrl(portfolio.image_before)} alt="Avant" className="w-full h-full object-cover rounded" />
                            </div>
                          )}
                          {portfolio.image_after && (
                            <div className="relative w-24">
                              <span className="absolute top-1 left-1 bg-blue-600/80 text-white text-[10px] px-1 rounded">Ap.</span>
                              <img src={getFileUrl(portfolio.image_after)} alt="Après" className="w-full h-full object-cover rounded" />
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default AdminBlog;
import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, Settings, LogOut, FileImage } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token && location.pathname !== '/admin/login') {
    window.location.href = '/admin/login';
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  if (location.pathname === '/admin/login') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-xl text-gray-800 border-b">
          Admin CRM
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link to="/admin" className={`flex items-center px-2 py-2 rounded-md ${location.pathname === '/admin' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link to="/admin/inbox" className={`flex items-center px-2 py-2 rounded-md ${location.pathname === '/admin/inbox' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Inbox className="w-5 h-5 mr-3" /> Boîte de réception
          </Link>
          <Link to="/admin/blog" className={`flex items-center px-2 py-2 rounded-md ${location.pathname.startsWith('/admin/blog') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <FileImage className="w-5 h-5 mr-3" /> Réalisations (Blog)
          </Link>
          <Link to="/admin/settings" className={`flex items-center px-2 py-2 rounded-md ${location.pathname === '/admin/settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Settings className="w-5 h-5 mr-3" /> Paramètres
          </Link>
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center w-full px-2 py-2 text-red-600 hover:bg-red-50 rounded-md">
            <LogOut className="w-5 h-5 mr-3" /> Déconnexion
          </button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;

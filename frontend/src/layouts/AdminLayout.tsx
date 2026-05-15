import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Settings,
  LogOut,
  FileImage,
  Users as UsersIcon,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isSuperAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const linkClass = (path: string, exact = false) => {
    const active = exact
      ? location.pathname === path
      : location.pathname.startsWith(path);
    return `flex items-center px-3 py-2 rounded-md transition-colors ${
      active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-xl text-gray-800 border-b">
          Luxclean CRM
        </div>
        {user && (
          <div className="px-6 py-3 border-b text-sm">
            <div className="font-medium text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500">
              {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </div>
          </div>
        )}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link to="/admin" className={linkClass('/admin', true)}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link to="/admin/inbox" className={linkClass('/admin/inbox')}>
            <Inbox className="w-5 h-5 mr-3" /> Boîte de réception
          </Link>
          <Link to="/admin/blog" className={linkClass('/admin/blog')}>
            <FileImage className="w-5 h-5 mr-3" /> Réalisations (Blog)
          </Link>
          <Link to="/admin/settings" className={linkClass('/admin/settings')}>
            <Settings className="w-5 h-5 mr-3" /> Paramètres
          </Link>
          {isSuperAdmin && (
            <Link to="/admin/users" className={linkClass('/admin/users')}>
              <UsersIcon className="w-5 h-5 mr-3" /> Administrateurs
            </Link>
          )}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
          >
            <LogOut className="w-5 h-5 mr-3" /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

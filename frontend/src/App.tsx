import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Services from './pages/Services';
import Quote from './pages/Quote';
import Recruitment from './pages/Recruitment';
import Blog from './pages/Blog';
import Actualites from './pages/Actualites';
import ActualiteDetail from './pages/ActualiteDetail';
import PortfolioDetail from './pages/PortfolioDetail';
import Contact from './pages/Contact';

import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminInbox from './pages/admin/Inbox';
import AdminSettings from './pages/admin/Settings';
import AdminBlog from './pages/admin/Blog';
import AdminUsers from './pages/admin/Users';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Site public */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="devis" element={<Quote />} />
            <Route path="recrutement" element={<Recruitment />} />
            <Route path="portfolio" element={<Blog />} />
            <Route path="portfolio/:id" element={<PortfolioDetail />} />
            <Route path="actualites" element={<Actualites />} />
            <Route path="actualites/:id" element={<ActualiteDetail />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Login (public) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Back-office protégé (Tâche 5.1) */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="inbox" element={<AdminInbox />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route
              path="users"
              element={
                <PrivateRoute requireSuperAdmin>
                  <AdminUsers />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

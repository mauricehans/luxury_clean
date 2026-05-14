import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Services from './pages/Services';
import Quote from './pages/Quote';
import Recruitment from './pages/Recruitment';
import Blog from './pages/Blog';
import Actualites from './pages/Actualites';
import Contact from './pages/Contact';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminInbox from './pages/admin/Inbox';
import AdminSettings from './pages/admin/Settings';
import AdminBlog from './pages/admin/Blog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="devis" element={<Quote />} />
          <Route path="recrutement" element={<Recruitment />} />
          <Route path="portfolio" element={<Blog />} />
          <Route path="actualites" element={<Actualites />} />
          <Route path="contact" element={<Contact />} />
        </Route>
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="login" element={<AdminLogin />} />
          <Route index element={<AdminDashboard />} />
          <Route path="inbox" element={<AdminInbox />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

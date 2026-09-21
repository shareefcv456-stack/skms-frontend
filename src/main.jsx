import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import './index.css';
import { SiteProvider } from './lib/site.jsx';
import { AuthProvider } from './lib/auth.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Courses from './pages/Courses.jsx';
import Plans from './pages/Plans.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Demo from './pages/Demo.jsx';
import Faq from './pages/Faq.jsx';
import Dashboard from './pages/Dashboard.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="courses" element={<Courses />} />
              <Route path="plans" element={<Plans />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="demo" element={<Demo />} />
              <Route path="faq" element={<Faq />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SiteProvider>
  </StrictMode>,
);

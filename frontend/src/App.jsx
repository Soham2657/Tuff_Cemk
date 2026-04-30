import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Canteen from './pages/Canteen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Events from './pages/Events';
import Clubs from './pages/Clubs';
import Admin from './pages/Admin';
import EventDetails from './pages/EventDetails';
import ClubDetails from './pages/ClubDetails';
import Announcements from './pages/Announcements';
import Schedule from './pages/Schedule';
import Notifications from './pages/Notifications';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';
import LoadingAnimation from './components/LoadingAnimation';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user || String(user.role || '').trim().toLowerCase() !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

const Layout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface font-['Plus_Jakarta_Sans'] antialiased min-h-screen flex">
      <Sidebar />
      <div className="ml-70 flex-1 flex flex-col min-h-screen relative">
        <Header />
        <main className="flex-1 p-10 max-w-360 mx-auto w-full">
          {children}
        </main>
        
        {/* Floating AI Chatbot Button */}
        <button onClick={() => navigate('/ai')} className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all z-50 flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-primary-container">
          <span className="material-symbols-outlined icon-fill text-[28px] group-hover:scale-110 transition-transform">smart_toy</span>
        </button>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/canteen" 
        element={
          <ProtectedRoute>
            <Layout><Canteen /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/events" 
        element={
          <ProtectedRoute>
            <Layout><Events /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <Layout><EventDetails /></Layout>
          </ProtectedRoute>
        }
      />
      <Route 
        path="/clubs" 
        element={
          <ProtectedRoute>
            <Layout><Clubs /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route
        path="/clubs/:id"
        element={
          <ProtectedRoute>
            <Layout><ClubDetails /></Layout>
          </ProtectedRoute>
        }
      />
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <Layout><Admin /></Layout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <Layout><Notifications /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ai" 
        element={
          <ProtectedRoute>
            <Layout><AIAssistant /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/announcements" 
        element={
          <ProtectedRoute>
            <Layout><Announcements /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/schedule" 
        element={
          <ProtectedRoute>
            <Layout><Schedule /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Show loading animation for initial app load
    const timer = setTimeout(() => setIsAppLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LoadingAnimation isLoading={isAppLoading} />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;

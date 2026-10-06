import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfile from './pages/candidate/CandidateProfile';
import JobSearch from './pages/candidate/JobSearch';
import CandidateApplications from './pages/candidate/CandidateApplications';
import SavedJobs from './pages/candidate/SavedJobs';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CompanyProfile from './pages/recruiter/CompanyProfile';
import ManageJobs from './pages/recruiter/ManageJobs';
import CreateEditJob from './pages/recruiter/CreateEditJob';
import ApplicantReview from './pages/recruiter/ApplicantReview';
import CandidateSearch from './pages/recruiter/CandidateSearch';

// Shared Pages
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading application...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

// Layout Wrapper
const AppLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {user && <Sidebar />}
        <main style={{ flex: 1, padding: user ? '28px' : '0', width: '100%', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// Root Index Redirect
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'recruiter' ? <Navigate to="/recruiter/dashboard" replace /> : <Navigate to="/candidate/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Candidate Routes */}
              <Route path="/candidate/dashboard" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
              <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateProfile /></ProtectedRoute>} />
              <Route path="/candidate/jobs" element={<ProtectedRoute allowedRoles={['candidate']}><JobSearch /></ProtectedRoute>} />
              <Route path="/candidate/applications" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateApplications /></ProtectedRoute>} />
              <Route path="/candidate/saved" element={<ProtectedRoute allowedRoles={['candidate']}><SavedJobs /></ProtectedRoute>} />
              <Route path="/candidate/notifications" element={<ProtectedRoute allowedRoles={['candidate']}><NotificationsPage /></ProtectedRoute>} />
              <Route path="/candidate/messages" element={<ProtectedRoute allowedRoles={['candidate']}><ChatPage /></ProtectedRoute>} />

              {/* Recruiter Routes */}
              <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
              <Route path="/recruiter/company" element={<ProtectedRoute allowedRoles={['recruiter']}><CompanyProfile /></ProtectedRoute>} />
              <Route path="/recruiter/jobs" element={<ProtectedRoute allowedRoles={['recruiter']}><ManageJobs /></ProtectedRoute>} />
              <Route path="/recruiter/jobs/new" element={<ProtectedRoute allowedRoles={['recruiter']}><CreateEditJob /></ProtectedRoute>} />
              <Route path="/recruiter/jobs/edit/:id" element={<ProtectedRoute allowedRoles={['recruiter']}><CreateEditJob /></ProtectedRoute>} />
              <Route path="/recruiter/applications" element={<ProtectedRoute allowedRoles={['recruiter']}><ApplicantReview /></ProtectedRoute>} />
              <Route path="/recruiter/candidates" element={<ProtectedRoute allowedRoles={['recruiter']}><CandidateSearch /></ProtectedRoute>} />
              <Route path="/recruiter/notifications" element={<ProtectedRoute allowedRoles={['recruiter']}><NotificationsPage /></ProtectedRoute>} />
              <Route path="/recruiter/messages" element={<ProtectedRoute allowedRoles={['recruiter']}><ChatPage /></ProtectedRoute>} />

              {/* Settings Route */}
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import SubmitReview from './pages/SubmitReview';
import ReviewResult from './pages/ReviewResult';
import AdminDashboard from './pages/AdminDashboard';
import FairnessAnalytics from './pages/FairnessAnalytics';
import ExplanationViewer from './pages/ExplanationViewer';
import Navbar from './components/Navbar';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Navigate to={user.role === 'student' ? '/dashboard' : '/admin'} /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/submit-review" element={<ProtectedRoute roles={['student']}><SubmitReview /></ProtectedRoute>} />
        <Route path="/review/:id" element={<ProtectedRoute><ReviewResult /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin', 'sysadmin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute roles={['admin', 'sysadmin']}><FairnessAnalytics /></ProtectedRoute>} />
        <Route path="/explanation/:id" element={<ProtectedRoute><ExplanationViewer /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

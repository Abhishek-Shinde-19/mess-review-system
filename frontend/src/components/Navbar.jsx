import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EM</span>
              </div>
              <span className="font-bold text-xl text-gray-900">EMRS</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              {user?.role === 'student' && (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/submit-review" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                    Submit Review
                  </Link>
                </>
              )}
              {(user?.role === 'admin' || user?.role === 'sysadmin') && (
                <>
                  <Link to="/admin" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/analytics" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                    Fairness Analytics
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{user?.name}</span>
              <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs capitalize">
                {user?.role}
              </span>
            </div>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

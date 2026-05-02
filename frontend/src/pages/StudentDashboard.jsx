import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../services/endpoints';
import { useAuth } from '../hooks/useAuth';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import CredibilityMeter from '../components/CredibilityMeter';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, valid: 0, suspicious: 0, spam: 0 });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const res = await reviewService.getAll({ limit: 50 });
      const data = res.data.data;
      setReviews(data);

      // Calculate stats
      let valid = 0, suspicious = 0, spam = 0;
      data.forEach(r => {
        const s = r.metricsResult?.status;
        if (s === 'Valid') valid++;
        else if (s === 'Suspicious') suspicious++;
        else if (s === 'Likely Spam') spam++;
      });
      setStats({ total: data.length, valid, suspicious, spam });
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here are your mess reviews.</p>
        </div>
        <Link to="/submit-review" className="btn-primary">
          + Submit Review
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="card border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Valid</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.valid}</p>
        </div>
        <div className="card border-l-4 border-l-yellow-500">
          <p className="text-sm text-gray-500">Suspicious</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.suspicious}</p>
        </div>
        <div className="card border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Flagged / Spam</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stats.spam}</p>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg">No reviews submitted yet</p>
          <Link to="/submit-review" className="btn-primary mt-4 inline-block">Submit Your First Review</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Link key={review._id} to={`/review/${review._id}`} className="block">
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <StarRating rating={review.rating} size="sm" />
                      <StatusBadge status={review.metricsResult?.status || 'Valid'} />
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment || 'No comment provided'}</p>
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      <span>Hostel: {review.hostelBlock}</span>
                      <span>Food: {review.foodQuality}/5</span>
                      <span>Clean: {review.cleanliness}/5</span>
                      <span>Service: {review.service}/5</span>
                      <span>{new Date(review.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4 w-40">
                    {review.metricsResult && (
                      <CredibilityMeter score={review.metricsResult.credibilityScore} />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

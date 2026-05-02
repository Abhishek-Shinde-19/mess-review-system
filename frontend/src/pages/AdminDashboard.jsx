import { useState, useEffect } from 'react';
import { reportService, reviewService } from '../services/endpoints';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, reviewsRes] = await Promise.all([
        reportService.getAdmin(),
        reviewService.getAll({ limit: 50 })
      ]);
      setStats(statsRes.data.data);
      setReviews(reviewsRes.data.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
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

  if (!stats) return <p className="text-center text-gray-500 py-8">Failed to load dashboard data.</p>;

  // Pie chart data for metrics status
  const metricsStatusData = [
    { name: 'Valid', value: stats.metricsStats['Valid'] || 0 },
    { name: 'Suspicious', value: stats.metricsStats['Suspicious'] || 0 },
    { name: 'Likely Spam', value: stats.metricsStats['Likely Spam'] || 0 }
  ].filter(d => d.value > 0);

  // Rating distribution chart
  const ratingData = stats.ratingDistribution.map(r => ({
    rating: `${r._id} Star`,
    count: r.count
  }));

  // Timeline chart
  const timelineData = stats.timeline.map(t => ({
    date: t._id,
    reviews: t.count,
    avgRating: parseFloat(t.avgRating.toFixed(1))
  }));

  // Hostel stats table
  const hostelData = stats.hostelStats.map(h => ({
    hostel: h._id,
    avgRating: h.avgRating.toFixed(1),
    count: h.totalReviews,
    food: h.avgFoodQuality.toFixed(1),
    clean: h.avgCleanliness.toFixed(1),
    service: h.avgService.toFixed(1)
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of all mess reviews and moderation results</p>
        </div>
        <Link to="/analytics" className="btn-secondary">
          Fairness Analytics &rarr;
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalReviews}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
        </div>
        <div className="card border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Valid Reviews</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.metricsStats['Valid'] || 0}</p>
        </div>
        <div className="card border-l-4 border-l-yellow-500">
          <p className="text-sm text-gray-500">Suspicious</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.metricsStats['Suspicious'] || 0}</p>
        </div>
        <div className="card border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Flagged / Spam</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stats.flaggedCount}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution Pie */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Status Distribution</h3>
          {metricsStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={metricsStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {metricsStatusData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No data available</p>
          )}
        </div>

        {/* Rating Distribution Bar */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline */}
      {timelineData.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Activity Timeline (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="reviews" stroke="#3b82f6" strokeWidth={2} name="Reviews" />
              <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke="#22c55e" strokeWidth={2} name="Avg Rating" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Hostel Stats Table */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hostel-wise Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Hostel</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Reviews</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Avg Rating</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Food</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Cleanliness</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Service</th>
              </tr>
            </thead>
            <tbody>
              {hostelData.map((h) => (
                <tr key={h.hostel} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{h.hostel}</td>
                  <td className="text-center py-3 px-4">{h.count}</td>
                  <td className="text-center py-3 px-4"><StarRating rating={Math.round(parseFloat(h.avgRating))} size="sm" /></td>
                  <td className="text-center py-3 px-4">{h.food}</td>
                  <td className="text-center py-3 px-4">{h.clean}</td>
                  <td className="text-center py-3 px-4">{h.service}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agreement Stats */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engine Agreement</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{(stats.agreementStats.avgAgreement * 100).toFixed(0)}%</p>
            <p className="text-sm text-blue-600">Avg Agreement</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{stats.agreementStats.total - stats.agreementStats.disagreements}</p>
            <p className="text-sm text-green-600">Agreements</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-700">{stats.agreementStats.disagreements}</p>
            <p className="text-sm text-red-600">Disagreements</p>
          </div>
        </div>
      </div>

      {/* Recent Flagged Reviews */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Reviews</h3>
        <div className="space-y-3">
          {reviews.map((r) => (
            <Link key={r._id} to={`/review/${r._id}`} className="block">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <StarRating rating={r.rating} size="sm" />
                  <span className="text-sm text-gray-600 truncate max-w-xs">{r.comment || 'No comment'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500">{r.hostelBlock}</span>
                  <span className="text-xs text-gray-400">{r.userId?.name || 'Unknown'}</span>
                  <StatusBadge status={r.metricsResult?.status || 'Valid'} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

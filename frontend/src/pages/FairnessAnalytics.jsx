import { useState, useEffect } from 'react';
import { reportService } from '../services/endpoints';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function FairnessAnalytics() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'disagreements') params.disagreementsOnly = 'true';
      const res = await reportService.getFairness(params);
      setReports(res.data.data);
    } catch (err) {
      console.error('Error loading fairness reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalReports = reports.length;
  const agreements = reports.filter(r => !r.isDisagreement).length;
  const disagreements = reports.filter(r => r.isDisagreement).length;
  const avgAgreement = totalReports > 0
    ? (reports.reduce((s, r) => s + r.agreementScore, 0) / totalReports * 100).toFixed(0)
    : 0;

  // Agreement distribution chart
  const agreementBuckets = [
    { range: '0%', count: reports.filter(r => r.agreementScore === 0).length },
    { range: '50%', count: reports.filter(r => r.agreementScore === 0.5).length },
    { range: '100%', count: reports.filter(r => r.agreementScore === 1).length }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fairness Analytics</h1>
          <p className="text-gray-600 mt-1">Comparison between Metrics Engine and AI Engine results</p>
        </div>
        <Link to="/admin" className="btn-secondary">&larr; Dashboard</Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500">Total Reports</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalReports}</p>
        </div>
        <div className="card border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500">Avg Agreement</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{avgAgreement}%</p>
        </div>
        <div className="card border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500">Agreements</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{agreements}</p>
        </div>
        <div className="card border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500">Disagreements</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{disagreements}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agreement Score Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={agreementBuckets}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Reports
        </button>
        <button
          onClick={() => setFilter('disagreements')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'disagreements' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Disagreements Only
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No fairness reports available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className={`card ${report.isDisagreement ? 'border-l-4 border-l-red-500' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {report.reviewId?.userId?.name || 'Unknown User'}
                    </span>
                    {report.isDisagreement && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        DISAGREEMENT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Metrics:</span>
                      <StatusBadge status={report.metricsStatus} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">AI:</span>
                      <StatusBadge status={report.aiPrediction} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Agreement:</span>
                      <span className={`font-semibold text-sm ${
                        report.agreementScore >= 0.7 ? 'text-green-600' :
                        report.agreementScore >= 0.3 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(report.agreementScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{report.combinedExplanation}</p>
                </div>
                <Link to={`/explanation/${report.reviewId?._id}`} className="text-primary-600 hover:underline text-xs ml-4">
                  Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

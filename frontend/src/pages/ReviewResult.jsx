import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reviewService } from '../services/endpoints';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import CredibilityMeter from '../components/CredibilityMeter';
import FeatureImpactChart from '../components/FeatureImpactChart';

export default function ReviewResult() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReview();
  }, [id]);

  const loadReview = async () => {
    try {
      const res = await reviewService.getById(id);
      setReview(res.data.data);
    } catch (err) {
      console.error('Error loading review:', err);
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

  if (!review) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Review not found</p>
          <Link to="/dashboard" className="btn-primary mt-4 inline-block">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const metrics = review.metricsResult;
  const ai = review.aiResult;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Link to="/dashboard" className="text-primary-600 hover:underline text-sm">&larr; Back to Dashboard</Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Review Analysis Result</h1>

      {/* Review Summary */}
      <div className="card mb-6">
        <div className="flex justify-between items-start">
          <div>
            <StarRating rating={review.rating} size="lg" />
            <p className="text-gray-700 mt-3">{review.comment || 'No comment provided'}</p>
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              <span>Hostel: <strong>{review.hostelBlock}</strong></span>
              <span>Food: <strong>{review.foodQuality}/5</strong></span>
              <span>Cleanliness: <strong>{review.cleanliness}/5</strong></span>
              <span>Service: <strong>{review.service}/5</strong></span>
              <span>{new Date(review.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Metrics Engine Result */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Metrics Engine</h2>
          </div>

          {metrics ? (
            <>
              <div className="mb-4">
                <StatusBadge status={metrics.status} />
              </div>
              <CredibilityMeter score={metrics.credibilityScore} />

              {metrics.flags && metrics.flags.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Flags Detected</h3>
                  <div className="space-y-2">
                    {metrics.flags.map((flag, i) => (
                      <div key={i} className={`p-2 rounded-lg text-xs border ${
                        flag.severity === 'high' ? 'bg-red-50 border-red-200 text-red-700' :
                        flag.severity === 'medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        'bg-blue-50 border-blue-200 text-blue-700'
                      }`}>
                        <strong className="capitalize">{flag.severity}:</strong> {flag.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {metrics.explanation && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{metrics.explanation}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">Metrics analysis not available</p>
          )}
        </div>

        {/* AI Engine Result */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">AI Engine</h2>
          </div>

          {ai ? (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <StatusBadge status={ai.prediction} />
                <span className="text-sm text-gray-600">
                  Confidence: <strong>{(ai.confidence * 100).toFixed(0)}%</strong>
                </span>
              </div>

              {ai.topFeatures && ai.topFeatures.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Feature Impact (SHAP)</h3>
                  <FeatureImpactChart features={ai.topFeatures} />
                </div>
              )}

              {ai.explanation && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{ai.explanation}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">AI analysis not available</p>
          )}
        </div>
      </div>

      {/* View Full Explanation */}
      <div className="text-center">
        <Link to={`/explanation/${review._id}`} className="btn-secondary">
          View Full Explanation &rarr;
        </Link>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reviewService } from '../services/endpoints';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import CredibilityMeter from '../components/CredibilityMeter';
import FeatureImpactChart from '../components/FeatureImpactChart';

export default function ExplanationViewer() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const res = await reviewService.getById(id);
      setReview(res.data.data);
    } catch (err) {
      console.error('Error loading explanation:', err);
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
          <p className="text-gray-500">Review not found</p>
        </div>
      </div>
    );
  }

  const metrics = review.metricsResult;
  const ai = review.aiResult;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to={`/review/${id}`} className="text-primary-600 hover:underline text-sm mb-6 block">
        &larr; Back to Review
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Explanation Viewer</h1>
      <p className="text-gray-600 mb-8">
        Detailed transparency report for this review showing how both engines arrived at their assessment.
      </p>

      {/* Review Context */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Review Context</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Overall</p>
            <p className="text-2xl font-bold text-gray-900">{review.rating}/5</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Food</p>
            <p className="text-2xl font-bold text-gray-900">{review.foodQuality}/5</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Cleanliness</p>
            <p className="text-2xl font-bold text-gray-900">{review.cleanliness}/5</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Service</p>
            <p className="text-2xl font-bold text-gray-900">{review.service}/5</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Hostel</p>
            <p className="text-lg font-bold text-gray-900">{review.hostelBlock}</p>
          </div>
        </div>
        {review.comment && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
          </div>
        )}
      </div>

      {/* Metrics Engine Explanation */}
      <div className="card mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-700 font-bold text-sm">ME</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Metrics-Based Fairness Engine</h2>
            <p className="text-sm text-gray-500">Rule-based credibility analysis</p>
          </div>
        </div>

        {metrics ? (
          <>
            <div className="flex items-center space-x-4 mb-4">
              <StatusBadge status={metrics.status} />
            </div>

            <CredibilityMeter score={metrics.credibilityScore} />

            {/* Score Breakdown */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Score Breakdown (Penalty Points)</h3>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Frequency', value: metrics.details?.reviewFrequencyScore || 0 },
                  { label: 'Spike', value: metrics.details?.spikeScore || 0 },
                  { label: 'Variance', value: metrics.details?.varianceScore || 0 },
                  { label: 'IP', value: metrics.details?.ipScore || 0 },
                  { label: 'Timing', value: metrics.details?.timingScore || 0 }
                ].map((d) => (
                  <div key={d.label} className={`text-center p-3 rounded-lg ${
                    d.value > 0 ? 'bg-red-50' : 'bg-green-50'
                  }`}>
                    <p className="text-xs text-gray-500">{d.label}</p>
                    <p className={`text-xl font-bold ${d.value > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      -{d.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Flags */}
            {metrics.flags && metrics.flags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Detected Flags</h3>
                <div className="space-y-2">
                  {metrics.flags.map((flag, i) => (
                    <div key={i} className={`flex items-start space-x-3 p-3 rounded-lg border ${
                      flag.severity === 'high' ? 'bg-red-50 border-red-200' :
                      flag.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        flag.severity === 'high' ? 'bg-red-500' :
                        flag.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></span>
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">{flag.rule}</p>
                        <p className="text-sm text-gray-700">{flag.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Natural Language Explanation</h3>
              <p className="text-sm text-gray-700">{metrics.explanation}</p>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">Metrics analysis not available for this review.</p>
        )}
      </div>

      {/* AI Engine Explanation */}
      <div className="card mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-700 font-bold text-sm">AI</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI-Based Classifier Engine</h2>
            <p className="text-sm text-gray-500">Machine Learning prediction with SHAP explainability</p>
          </div>
        </div>

        {ai ? (
          <>
            <div className="flex items-center space-x-4 mb-4">
              <StatusBadge status={ai.prediction} />
              <span className="text-sm text-gray-600">
                Confidence: <strong className="text-lg">{(ai.confidence * 100).toFixed(0)}%</strong>
              </span>
            </div>

            {/* Feature Impact Chart */}
            {ai.topFeatures && ai.topFeatures.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">SHAP Feature Impact</h3>
                <FeatureImpactChart features={ai.topFeatures} />
              </div>
            )}

            {/* Feature List */}
            {ai.topFeatures && ai.topFeatures.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Top Contributing Features</h3>
                <div className="space-y-2">
                  {ai.topFeatures.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700 capitalize">{f.feature.replace(/_/g, ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(f.impact * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">
                          {(f.impact * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Natural Language Explanation</h3>
              <p className="text-sm text-gray-700">{ai.explanation || 'No explanation available'}</p>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">AI analysis not available for this review.</p>
        )}
      </div>

      {/* Comparison Summary */}
      {metrics && ai && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparison Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Aspect</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-600">Metrics Engine</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-600">AI Engine</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-700">Classification</td>
                  <td className="text-center py-2 px-3"><StatusBadge status={metrics.status} /></td>
                  <td className="text-center py-2 px-3"><StatusBadge status={ai.prediction} /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-700">Score / Confidence</td>
                  <td className="text-center py-2 px-3 font-semibold">{metrics.credibilityScore}/100</td>
                  <td className="text-center py-2 px-3 font-semibold">{(ai.confidence * 100).toFixed(0)}%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-700">Method</td>
                  <td className="text-center py-2 px-3 text-gray-500">Rule-based</td>
                  <td className="text-center py-2 px-3 text-gray-500">Random Forest + SHAP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

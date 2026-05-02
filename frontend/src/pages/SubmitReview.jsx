import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '../services/endpoints';
import { useAuth } from '../hooks/useAuth';

export default function SubmitReview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    rating: 3,
    foodQuality: 3,
    cleanliness: 3,
    service: 3,
    comment: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'comment' ? value : parseInt(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await reviewService.create(form);
      navigate(`/review/${res.data.data.review._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const RatingSelect = ({ label, name, value }) => (
    <div>
      <label className="label">{label}</label>
      <div className="flex space-x-2 mt-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setForm({ ...form, [name]: n })}
            className={`w-12 h-12 rounded-lg font-semibold transition-all ${
              value === n
                ? 'bg-primary-600 text-white shadow-md scale-110'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit Mess Review</h1>
        <p className="text-gray-600 mt-1">
          Rate your mess experience at <span className="font-semibold">{user?.hostelBlock}</span>
        </p>
      </div>

      <div className="card">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <RatingSelect label="Overall Rating" name="rating" value={form.rating} />
          <RatingSelect label="Food Quality" name="foodQuality" value={form.foodQuality} />
          <RatingSelect label="Cleanliness" name="cleanliness" value={form.cleanliness} />
          <RatingSelect label="Service" name="service" value={form.service} />

          <div>
            <label className="label">Comments (Optional)</label>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              rows={4}
              className="input-field resize-none"
              placeholder="Share your detailed experience about the mess food, cleanliness, and service..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1">{form.comment.length}/1000 characters</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-3">
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing & Submitting...
                </span>
              ) : 'Submit Review'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Your review will be analyzed by both Metrics and AI engines for fairness.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

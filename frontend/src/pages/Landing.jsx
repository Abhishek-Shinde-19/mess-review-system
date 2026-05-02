import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">EM</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">EMRS</span>
          </div>
          <div className="space-x-3">
            <Link to="/login" className="btn-secondary">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Explainable Mess
            <span className="text-primary-600"> Reviewing System</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            A transparent, AI-powered system for fair and unbiased mess (canteen) reviews.
            Powered by dual moderation engines with full explainability.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Submit a Review
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3">
              Admin Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Metrics-Based Engine</h3>
            <p className="mt-2 text-gray-600 text-sm">Rule-based system that checks review frequency, rating spikes, IP patterns, and timing anomalies.</p>
          </div>

          <div className="card text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Moderation Engine</h3>
            <p className="mt-2 text-gray-600 text-sm">Machine learning classifier with SHAP explainability for transparent predictions.</p>
          </div>

          <div className="card text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Fairness Comparison</h3>
            <p className="mt-2 text-gray-600 text-sm">Side-by-side comparison of both engines with agreement scores and disagreement highlighting.</p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <p className="text-center text-gray-500 text-sm">
          EMRS &copy; 2026 &mdash; Explainable Mess Reviewing System. Built for academic evaluation.
        </p>
      </footer>
    </div>
  );
}

export default function CredibilityMeter({ score }) {
  const getColor = () => {
    if (score >= 70) return { bar: 'bg-green-500', text: 'text-green-700', label: 'Valid' };
    if (score >= 40) return { bar: 'bg-yellow-500', text: 'text-yellow-700', label: 'Suspicious' };
    return { bar: 'bg-red-500', text: 'text-red-700', label: 'Likely Spam' };
  };

  const c = getColor();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Credibility Score</span>
        <span className={`text-sm font-bold ${c.text}`}>{score}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${c.bar} transition-all duration-500`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <p className={`text-xs mt-1 ${c.text} font-medium`}>{c.label}</p>
    </div>
  );
}

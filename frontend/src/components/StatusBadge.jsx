export default function StatusBadge({ status }) {
  const normalized = status?.toLowerCase().replace(' ', '_');
  const config = {
    valid: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', dot: 'bg-green-500', label: 'Valid' },
    suspicious: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500', label: 'Suspicious' },
    spam: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500', label: 'Spam' },
    likely_spam: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500', label: 'Likely Spam' },
  };

  const c = config[normalized] || config.valid;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} mr-1.5`}></span>
      {c.label}
    </span>
  );
}

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FeatureImpactChart({ features }) {
  if (!features || features.length === 0) {
    return <p className="text-gray-500 text-sm">No feature data available</p>;
  }

  const data = features.map(f => ({
    name: f.feature.replace(/_/g, ' '),
    impact: parseFloat((f.impact * 100).toFixed(1))
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} />
          <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [`${value}%`, 'Impact']} />
          <Bar dataKey="impact" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

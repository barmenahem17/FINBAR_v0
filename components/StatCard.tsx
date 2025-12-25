interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, subtitle, change }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
      <h3 className="text-sm font-medium text-zinc-500 mb-1">{title}</h3>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-900">{value}</span>
        {change && (
          <span
            className={`text-sm font-medium ${
              change.isPositive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {change.isPositive ? "+" : ""}{change.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>
      )}
    </div>
  );
}


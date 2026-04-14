interface StatCardProps {
  label: string;
  value: string;
  hint: string;
}

export const StatCard = ({ label, value, hint }: StatCardProps) => (
  <div className="stat-card">
    <p className="stat-label">{label}</p>
    <p className="stat-value">{value}</p>
    <p className="stat-hint">{hint}</p>
  </div>
);

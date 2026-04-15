export const LoadingBlock = ({ label }: { label: string }) => (
  <div className="loading-block">
    <div className="loading-dot" />
    <p>{label}</p>
  </div>
);

"use client";

export default function RootErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <p className="page-eyebrow">Something went wrong</p>
        <h1>The page could not be loaded.</h1>
        <p className="muted">{error.message || "An unexpected error interrupted the request."}</p>
        <div className="auth-actions">
          <button className="primary-button" type="button" onClick={() => reset()}>
            Try again
          </button>
          <a href="/login" className="ghost-button">
            Go to login
          </a>
        </div>
      </div>
    </div>
  );
}

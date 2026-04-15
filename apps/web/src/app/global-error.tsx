"use client";

export default function GlobalErrorPage() {
  return (
    <html lang="en">
      <body>
        <div className="auth-wrap">
          <div className="auth-card">
            <p className="page-eyebrow">Application error</p>
            <h1>Radar Domače could not render this page.</h1>
            <p className="muted">Return to login and continue with one of the seeded demo flows.</p>
            <div className="auth-actions">
              <a href="/login" className="primary-button">
                Go to login
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

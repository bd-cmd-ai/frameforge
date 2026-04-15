import Link from "next/link";

export const UnauthorizedState = () => (
  <div className="empty-state">
    <h3>This portal is only for provider accounts.</h3>
    <p>Use a verified or claim-pending provider account to continue.</p>
    <div className="inline-actions">
      <Link href="/login" className="primary-button">
        Go to login
      </Link>
    </div>
  </div>
);

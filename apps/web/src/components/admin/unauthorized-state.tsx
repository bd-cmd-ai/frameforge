import Link from "next/link";

export const UnauthorizedState = () => (
  <div className="empty-state">
    <h3>Admin access required</h3>
    <p>This workspace is reserved for platform administrators.</p>
    <div className="inline-actions">
      <Link href="/login" className="primary-button">
        Go to login
      </Link>
    </div>
  </div>
);

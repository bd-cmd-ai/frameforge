import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export const EmptyState = ({ title, description, ctaHref, ctaLabel }: EmptyStateProps) => (
  <div className="empty-state">
    <h3>{title}</h3>
    <p>{description}</p>
    {ctaHref && ctaLabel ? (
      <div className="inline-actions">
        <Link href={ctaHref} className="primary-button">
          {ctaLabel}
        </Link>
      </div>
    ) : null}
  </div>
);

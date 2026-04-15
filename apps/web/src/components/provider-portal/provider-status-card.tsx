import Link from "next/link";
import type { ProviderDetail } from "@radar-domace/types";
import { Badge } from "../badge";
import { formatProviderStatus, pickLocalizedText } from "../../lib/provider/format";
import { ProviderSectionCard } from "./provider-section-card";

export const ProviderStatusCard = ({ provider }: { provider: ProviderDetail }) => (
  <ProviderSectionCard title="Provider identity" description="The public profile currently linked to this account.">
    <div className="stack-sm">
      <div className="list-item compact">
        <div>
          <strong>{pickLocalizedText(provider.name)}</strong>
          <p className="muted">{pickLocalizedText(provider.address)}</p>
        </div>
        <div className="inline-actions">
          <Badge>{provider.isVerified ? "Verified" : "Pending verification"}</Badge>
          <Badge>{formatProviderStatus(provider.status ?? "active")}</Badge>
        </div>
      </div>
      <div className="list-item compact">
        <div>
          <strong>Categories</strong>
          <p className="muted">
            {provider.categories.length > 0
              ? provider.categories.map((category) => pickLocalizedText(category.label)).join(", ")
              : "No categories selected yet"}
          </p>
        </div>
        <Link href="/provider/categories" className="ghost-button">
          Manage
        </Link>
      </div>
      <div className="quick-link-grid">
        <Link href="/provider/profile" className="ghost-button">
          Profile
        </Link>
        <Link href="/provider/images" className="ghost-button">
          Images
        </Link>
        <Link href="/provider/opening-hours" className="ghost-button">
          Opening hours
        </Link>
        <Link href="/provider/offers" className="ghost-button">
          Offers
        </Link>
      </div>
    </div>
  </ProviderSectionCard>
);

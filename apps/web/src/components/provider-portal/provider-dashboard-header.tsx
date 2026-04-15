import Link from "next/link";
import type { ProviderDetail } from "@radar-domace/types";
import { Badge } from "../badge";
import { pickLocalizedText } from "../../lib/provider/format";

export const ProviderDashboardHeader = ({
  provider,
  pendingClaim,
}: {
  provider: ProviderDetail | null;
  pendingClaim: boolean;
}) => (
  <section className="provider-hero">
    <div>
      <p className="page-eyebrow">Provider dashboard</p>
      <h2>{provider ? pickLocalizedText(provider.name) : "Finish your provider onboarding"}</h2>
      <p className="muted hero-copy">
        {provider
          ? "Keep your public profile current so travelers can find you, trust you, and stop by with confidence."
          : pendingClaim
            ? "Your claim request is pending review. While you wait, you can review the status and prepare your details."
            : "Claim your producer profile first, then you can manage details, opening hours, images, and offers here."}
      </p>
    </div>
    <div className="inline-actions">
      {provider ? (
        <>
          <Badge>{provider.isVerified ? "Verified" : "Awaiting verification"}</Badge>
          <Link href="/provider/profile" className="primary-button">
            Edit profile
          </Link>
        </>
      ) : (
        <Link href="/provider/claim" className="primary-button">
          Open claim flow
        </Link>
      )}
    </div>
  </section>
);

"use client";

import { approveClaimRequest, rejectClaimRequest } from "@radar-domace/api";
import type { AdminClaimRequestDetail } from "@radar-domace/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createWebBrowserSupabaseClient } from "../../../lib/supabase-browser";
import { ConfirmationActionDialog } from "../confirmation-action-dialog";

export const ClaimRequestReviewCard = ({
  claim,
  reviewerId,
}: {
  claim: AdminClaimRequestDetail;
  reviewerId: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const moderate = (action: "approve" | "reject") =>
    startTransition(async () => {
      setError(null);
      const client = createWebBrowserSupabaseClient();
      const result =
        action === "approve"
          ? await approveClaimRequest(client, { claimRequestId: claim.id, reviewerId })
          : await rejectClaimRequest(client, { claimRequestId: claim.id, reviewerId });

      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });

  return (
    <div className="stack-lg">
      <div className="list-item compact">
        <div>
          <strong>{claim.providerName}</strong>
          <p className="muted">
            {claim.requesterName} • {claim.requesterEmail}
          </p>
        </div>
        <span className="badge">{claim.status}</span>
      </div>
      <p className="note">{claim.note || "No verification note was provided."}</p>
      <div className="inline-actions">
        <ConfirmationActionDialog
          label="Approve claim"
          confirmLabel="Approve this claim and link the provider to the requester account?"
          onConfirm={() => moderate("approve")}
          variant="primary-button"
          disabled={isPending || claim.status !== "pending"}
        />
        <ConfirmationActionDialog
          label="Reject claim"
          confirmLabel="Reject this claim request?"
          onConfirm={() => moderate("reject")}
          disabled={isPending || claim.status !== "pending"}
        />
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
};

"use client";

import { updateAdminOfferStatus } from "@radar-domace/api";
import type { AdminOfferRecord } from "@radar-domace/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createWebBrowserSupabaseClient } from "../../../lib/supabase-browser";
import { formatOfferStatus } from "../../../lib/admin/format";
import { ConfirmationActionDialog } from "../confirmation-action-dialog";

export const OfferModerationTable = ({ offers }: { offers: AdminOfferRecord[] }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const updateStatus = (offerId: string, values: { isActive?: boolean; isApproved?: boolean }) =>
    startTransition(async () => {
      setError(null);
      setFeedback(null);
      const client = createWebBrowserSupabaseClient();
      const result = await updateAdminOfferStatus(client, {
        offerId,
        ...values,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setFeedback("Offer moderation state updated.");
      router.refresh();
    });

  return (
    <div className="stack-sm">
      <table className="table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Title</th>
            <th>Status</th>
            <th>Flags</th>
            <th>Validity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.id}>
              <td>{offer.providerName}</td>
              <td>{offer.title.sl || offer.title.en}</td>
              <td>{formatOfferStatus(offer)}</td>
              <td>
                <div className="inline-actions">
                  {offer.type === "fresh_today" ? <span className="badge">Fresh Today</span> : null}
                  {offer.type === "discount" ? <span className="badge">Discount</span> : null}
                </div>
              </td>
              <td>
                {new Date(offer.startsAt).toLocaleDateString()} - {new Date(offer.endsAt).toLocaleDateString()}
              </td>
              <td>
                <div className="inline-actions">
                  <ConfirmationActionDialog
                    label="Activate"
                    confirmLabel="Activate and approve this offer?"
                    onConfirm={() => updateStatus(offer.id, { isActive: true, isApproved: true })}
                    disabled={isPending}
                  />
                  <ConfirmationActionDialog
                    label="Archive"
                    confirmLabel="Archive this offer?"
                    onConfirm={() => updateStatus(offer.id, { isActive: false })}
                    disabled={isPending}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error ? <p className="field-error">{error}</p> : null}
      {!error && feedback ? <p className="field-success">{feedback}</p> : null}
    </div>
  );
};

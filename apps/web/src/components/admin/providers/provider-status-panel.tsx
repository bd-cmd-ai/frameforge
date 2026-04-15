"use client";

import { updateAdminProviderStatus, updateAdminProviderVerified } from "@radar-domace/api";
import type { ProviderDetail } from "@radar-domace/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createWebBrowserSupabaseClient } from "../../../lib/supabase-browser";
import { adminProviderStatusSchema } from "../../../lib/validation/admin";
import { ConfirmationActionDialog } from "../confirmation-action-dialog";

export const ProviderStatusPanel = ({
  provider,
  reviewerId,
}: {
  provider: ProviderDetail;
  reviewerId: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"draft" | "pending_verification" | "active" | "suspended">(
    (provider.status as "draft" | "pending_verification" | "active" | "suspended" | undefined) ?? "active",
  );
  const [verified, setVerified] = useState(provider.isVerified);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const parsed = adminProviderStatusSchema.safeParse({
      status,
      verified,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Status values are invalid.");
      setFeedback(null);
      return;
    }

    startTransition(async () => {
      setError(null);
      setFeedback(null);
      const client = createWebBrowserSupabaseClient();

      const statusResult = await updateAdminProviderStatus(client, {
        providerId: provider.id,
        status: parsed.data.status,
      });
      if (statusResult.error) {
        setError(statusResult.error);
        return;
      }

      const verifyResult = await updateAdminProviderVerified(client, {
        providerId: provider.id,
        verified: parsed.data.verified,
        reviewerId,
      });
      if (verifyResult.error) {
        setError(verifyResult.error);
        return;
      }

      setFeedback("Provider moderation state updated.");
      router.refresh();
    });
  };

  return (
    <div className="stack-lg">
      <div className="form-grid">
        <div className="field">
          <label>Status</label>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "draft" | "pending_verification" | "active" | "suspended")
            }
          >
            <option value="draft">Draft</option>
            <option value="pending_verification">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <label className="checkbox-row field">
          <span>Verified</span>
          <input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} />
        </label>
      </div>
      <div className="inline-actions">
        <button className="primary-button" type="button" onClick={save} disabled={isPending}>
          {isPending ? "Saving..." : "Save moderation state"}
        </button>
        <ConfirmationActionDialog
          label="Suspend provider"
          confirmLabel="Suspend this provider? This will hide it from discovery."
          onConfirm={async () => {
            setError(null);
            setFeedback(null);
            setStatus("suspended");
            const client = createWebBrowserSupabaseClient();
            const result = await updateAdminProviderStatus(client, { providerId: provider.id, status: "suspended" });
            if (result.error) {
              setError(result.error);
              return;
            }
            setFeedback("Provider suspended.");
            router.refresh();
          }}
          disabled={isPending}
        />
      </div>
      {error ? <p className="field-error">{error}</p> : null}
      {feedback ? <p className="field-success">{feedback}</p> : null}
    </div>
  );
};

"use client";

import { createClaimRequest, searchClaimableProviders, trackAnalyticsEvent } from "@radar-domace/api";
import type { ClaimRequest, ProviderSummary, UserProfile } from "@radar-domace/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createWebBrowserSupabaseClient } from "../../lib/supabase-browser";
import { claimRequestSchema } from "../../lib/validation/provider";
import { pickLocalizedText } from "../../lib/provider/format";

export const ClaimRequestFlow = ({
  profile,
  initialProviders,
  existingClaims,
}: {
  profile: UserProfile;
  initialProviders: ProviderSummary[];
  existingClaims: ClaimRequest[];
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [providers, setProviders] = useState(initialProviders);
  const [search, setSearch] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState(initialProviders[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState({
    requesterName: profile.fullName ?? "",
    requesterEmail: profile.email ?? "",
    requesterPhone: "",
    message: "",
  });

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const client = createWebBrowserSupabaseClient();
        const rows = await searchClaimableProviders(client, search, 24);
        setProviders(rows);
        if (rows.length > 0 && !rows.some((row) => row.id === selectedProviderId)) {
          setSelectedProviderId(rows[0].id);
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Claimable providers could not be loaded.");
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, selectedProviderId]);

  const pendingForSelected = existingClaims.some(
    (claim) => claim.providerId === selectedProviderId && claim.status === "pending",
  );

  const submit = () => {
    const parsed = claimRequestSchema.safeParse({
      providerId: selectedProviderId,
      requesterName: form.requesterName,
      requesterEmail: form.requesterEmail,
      requesterPhone: form.requesterPhone,
      message: form.message,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Claim request is invalid.");
      setFeedback(null);
      return;
    }

    if (pendingForSelected) {
      setError("There is already a pending request for this provider.");
      setFeedback(null);
      return;
    }

    startTransition(async () => {
      setError(null);
      setFeedback(null);
      const client = createWebBrowserSupabaseClient();
      const result = await createClaimRequest(client, {
        providerId: parsed.data.providerId,
        requesterName: parsed.data.requesterName,
        requesterEmail: parsed.data.requesterEmail,
        requesterPhone: parsed.data.requesterPhone || undefined,
        message: parsed.data.message,
        requesterUserId: profile.id,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      void trackAnalyticsEvent(client, {
        eventName: "claim_request_created",
        actorUserId: profile.id,
        actorRole: profile.role,
        providerId: parsed.data.providerId,
        metadata: {
          source: "provider_claim_flow",
        },
      });

      setFeedback("Claim request sent. An admin will review it soon.");
      router.refresh();
    });
  };

  return (
    <div className="stack-lg">
      <div className="field">
        <label>Find your provider</label>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or address" />
      </div>

      <div className="claim-grid">
        <div className="claim-search-results">
          {providers.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className={`claim-result ${selectedProviderId === provider.id ? "active" : ""}`}
              onClick={() => setSelectedProviderId(provider.id)}
            >
              <strong>{pickLocalizedText(provider.name)}</strong>
              <span className="muted">{pickLocalizedText(provider.address)}</span>
            </button>
          ))}
          {providers.length === 0 ? <p className="muted">No public provider records matched your search.</p> : null}
        </div>

        <div className="stack-lg">
          <div className="form-grid">
            <div className="field">
              <label>Your name</label>
              <input value={form.requesterName} onChange={(event) => setForm((current) => ({ ...current, requesterName: event.target.value }))} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.requesterEmail} onChange={(event) => setForm((current) => ({ ...current, requesterEmail: event.target.value }))} />
            </div>
            <div className="field full">
              <label>Phone</label>
              <input value={form.requesterPhone} onChange={(event) => setForm((current) => ({ ...current, requesterPhone: event.target.value }))} />
            </div>
            <div className="field full">
              <label>Message</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Tell us how you are connected to this producer and what should be verified."
              />
            </div>
          </div>

          <div className="inline-actions">
            <button className="primary-button" type="button" onClick={submit} disabled={isPending || pendingForSelected || !selectedProviderId}>
              {isPending ? "Submitting..." : "Submit claim request"}
            </button>
            {pendingForSelected ? <span className="muted">A pending request already exists for this profile.</span> : null}
          </div>
        </div>
      </div>

      {error ? <p className="field-error">{error}</p> : null}
      {feedback ? <p className="field-success">{feedback}</p> : null}
    </div>
  );
};

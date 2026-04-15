"use client";

import { createOfferPost, trackAnalyticsEvent, updateOfferPost } from "@radar-domace/api";
import type { ProductOffer } from "@radar-domace/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createWebBrowserSupabaseClient } from "../../lib/supabase-browser";
import { offerPostSchema } from "../../lib/validation/provider";
import { LocalizedTextFields } from "../forms/localized-text-fields";

const emptyText = { sl: "", en: "", de: "", it: "" };

const toInputDateTime = (value: string) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export const OfferPostForm = ({
  providerId,
  offer,
  onSaved,
  onCancel,
}: {
  providerId: string;
  offer?: ProductOffer | null;
  onSaved?: () => void;
  onCancel?: () => void;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: offer?.title ?? emptyText,
    body: offer?.body ?? emptyText,
    validFrom: offer ? toInputDateTime(offer.startsAt) : "",
    validTo: offer ? toInputDateTime(offer.endsAt) : "",
    isFreshToday: offer?.type === "fresh_today",
    isDiscount: offer?.type === "discount",
    priceLabel: offer?.priceLabel ?? "",
    discountPercent: offer?.discountPercent ?? null,
    status: (offer?.isActive ? "active" : "archived") as "active" | "archived",
  });

  useEffect(() => {
    setForm({
      title: offer?.title ?? emptyText,
      body: offer?.body ?? emptyText,
      validFrom: offer ? toInputDateTime(offer.startsAt) : "",
      validTo: offer ? toInputDateTime(offer.endsAt) : "",
      isFreshToday: offer?.type === "fresh_today",
      isDiscount: offer?.type === "discount",
      priceLabel: offer?.priceLabel ?? "",
      discountPercent: offer?.discountPercent ?? null,
      status: (offer?.isActive ? "active" : "archived") as "active" | "archived",
    });
  }, [offer]);

  const save = () => {
    const parsed = offerPostSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Offer data is invalid.");
      setFeedback(null);
      return;
    }

    const payload = parsed.data;
    const type = payload.isDiscount ? "discount" : payload.isFreshToday ? "fresh_today" : "general";

    startTransition(async () => {
      setError(null);
      setFeedback(null);
      const client = createWebBrowserSupabaseClient();
      const result = offer
        ? await updateOfferPost(client, {
            id: offer.id,
            providerId,
            type,
            title: payload.title,
            body: payload.body,
            startsAt: new Date(payload.validFrom).toISOString(),
            endsAt: new Date(payload.validTo).toISOString(),
            priceLabel: payload.priceLabel || null,
            discountPercent: payload.isDiscount ? payload.discountPercent : null,
            isActive: payload.status === "active",
          })
        : await createOfferPost(client, {
            providerId,
            type,
            title: payload.title,
            body: payload.body,
            startsAt: new Date(payload.validFrom).toISOString(),
            endsAt: new Date(payload.validTo).toISOString(),
            priceLabel: payload.priceLabel || null,
            discountPercent: payload.isDiscount ? payload.discountPercent : null,
            isActive: payload.status === "active",
          });

      if (result.error) {
        setError(result.error);
        return;
      }

      void trackAnalyticsEvent(client, {
        eventName: offer ? "offer_post_updated" : "offer_post_created",
        actorRole: "provider",
        providerId,
        metadata: {
          type,
          status: payload.status,
        },
      });

      setFeedback(offer ? "Offer updated." : "Offer created.");
      onSaved?.();
      router.refresh();
    });
  };

  return (
    <div className="stack-lg">
      <LocalizedTextFields label="Title" value={form.title} onChange={(title) => setForm((current) => ({ ...current, title }))} />
      <LocalizedTextFields label="Body" value={form.body} onChange={(body) => setForm((current) => ({ ...current, body }))} multiline />

      <div className="form-grid">
        <div className="field">
          <label>Valid from</label>
          <input type="datetime-local" value={form.validFrom} onChange={(event) => setForm((current) => ({ ...current, validFrom: event.target.value }))} />
        </div>
        <div className="field">
          <label>Valid to</label>
          <input type="datetime-local" value={form.validTo} onChange={(event) => setForm((current) => ({ ...current, validTo: event.target.value }))} />
        </div>
        <div className="field">
          <label>Price label</label>
          <input value={form.priceLabel} onChange={(event) => setForm((current) => ({ ...current, priceLabel: event.target.value }))} placeholder="e.g. 5 EUR / basket" />
        </div>
        <div className="field">
          <label>Discount percent</label>
          <input
            type="number"
            min="0"
            max="100"
            value={form.discountPercent ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                discountPercent: event.target.value ? Number(event.target.value) : null,
              }))
            }
          />
        </div>
        <div className="field">
          <label>Status</label>
          <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as "active" | "archived" }))}>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="inline-actions">
        <label className="checkbox-row">
          <input type="checkbox" checked={form.isFreshToday} onChange={(event) => setForm((current) => ({ ...current, isFreshToday: event.target.checked }))} />
          Fresh Today
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={form.isDiscount} onChange={(event) => setForm((current) => ({ ...current, isDiscount: event.target.checked }))} />
          Discount
        </label>
      </div>

      <div className="inline-actions">
        <button className="primary-button" type="button" onClick={save} disabled={isPending}>
          {isPending ? "Saving..." : offer ? "Save changes" : "Create offer"}
        </button>
        {offer && onCancel ? (
          <button className="ghost-button" type="button" onClick={onCancel}>
            Cancel edit
          </button>
        ) : null}
      </div>

      {error ? <p className="field-error">{error}</p> : null}
      {feedback ? <p className="field-success">{feedback}</p> : null}
    </div>
  );
};

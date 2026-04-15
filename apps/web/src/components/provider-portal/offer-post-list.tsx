"use client";

import { updateOfferPost } from "@radar-domace/api";
import type { ProductOffer } from "@radar-domace/types";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createWebBrowserSupabaseClient } from "../../lib/supabase-browser";
import { formatOfferStatus, pickLocalizedText } from "../../lib/provider/format";
import { Badge } from "../badge";

export const OfferPostList = ({
  offers,
  onEdit,
}: {
  offers: ProductOffer[];
  onEdit: (offer: ProductOffer) => void;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const archive = (offer: ProductOffer) =>
    startTransition(async () => {
      const client = createWebBrowserSupabaseClient();
      await updateOfferPost(client, {
        id: offer.id,
        isActive: false,
      });
      router.refresh();
    });

  return (
    <div className="list">
      {offers.map((offer) => (
        <div key={offer.id} className="list-item">
          <div className="stack-sm">
            <strong>{pickLocalizedText(offer.title)}</strong>
            <p className="muted">{pickLocalizedText(offer.body)}</p>
            <div className="inline-actions">
              <Badge>{formatOfferStatus(offer)}</Badge>
              {offer.type === "fresh_today" ? <Badge>Fresh Today</Badge> : null}
              {offer.type === "discount" ? <Badge>Discount</Badge> : null}
            </div>
          </div>
          <div className="inline-actions">
            <button className="ghost-button" type="button" onClick={() => onEdit(offer)}>
              Edit
            </button>
            <button className="ghost-button" type="button" onClick={() => archive(offer)} disabled={isPending}>
              Archive
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

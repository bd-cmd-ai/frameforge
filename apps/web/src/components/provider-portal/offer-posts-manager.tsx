"use client";

import type { ProductOffer } from "@radar-domace/types";
import { useState } from "react";
import { OfferPostForm } from "./offer-post-form";
import { OfferPostList } from "./offer-post-list";

export const OfferPostsManager = ({
  providerId,
  offers,
}: {
  providerId: string;
  offers: ProductOffer[];
}) => {
  const [editingOffer, setEditingOffer] = useState<ProductOffer | null>(null);

  return (
    <div className="grid two-col provider-two-col">
      <div className="section-card">
        <div className="section-head">
          <div>
            <h3>{editingOffer ? "Edit offer" : "Create offer"}</h3>
            <p>Use one post per highlight so Fresh Today and Discount badges stay clear in the consumer app.</p>
          </div>
        </div>
        <OfferPostForm
          providerId={providerId}
          offer={editingOffer}
          onSaved={() => setEditingOffer(null)}
          onCancel={() => setEditingOffer(null)}
        />
      </div>

      <div className="section-card">
        <div className="section-head">
          <div>
            <h3>Existing offers</h3>
            <p>Manage currently saved promotional posts.</p>
          </div>
        </div>
        {offers.length === 0 ? (
          <div className="empty-state compact">
            <h3>No offers yet</h3>
            <p>Create your first post so travelers can see what is fresh or discounted today.</p>
          </div>
        ) : (
          <OfferPostList offers={offers} onEdit={setEditingOffer} />
        )}
      </div>
    </div>
  );
};

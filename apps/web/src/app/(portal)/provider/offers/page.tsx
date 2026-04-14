import { providerApi } from "@radar-domace/api";
import { Badge } from "../../../../components/badge";
import { SectionCard } from "../../../../components/section-card";

export default async function ProviderOffersPage() {
  const provider = await providerApi.getProvider("provider-1");
  if (!provider) return null;

  return (
    <div className="grid two-col">
      <SectionCard title="Active offers" description="Fresh Today and Discount badges are driven from approved active posts.">
        <div className="list">
          {provider.offers.map((offer) => (
            <div key={offer.id} className="list-item">
              <div>
                <strong>{offer.title.sl}</strong>
                <p className="muted">{offer.body.sl}</p>
              </div>
              <Badge>{offer.type}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Create offer post" description="This form maps directly to the `product_offers` table.">
        <form className="form-grid">
          <div className="field full">
            <label>Offer type</label>
            <select defaultValue="fresh_today">
              <option value="fresh_today">Fresh today</option>
              <option value="discount">Discount</option>
              <option value="general">General</option>
              <option value="promoted">Promoted</option>
            </select>
          </div>
          <div className="field full">
            <label>Title (SL)</label>
            <input placeholder="Danes sveže ..." />
          </div>
          <div className="field full">
            <label>Body (SL)</label>
            <textarea placeholder="Describe the offer and timing." />
          </div>
          <div className="field">
            <label>Starts at</label>
            <input type="datetime-local" />
          </div>
          <div className="field">
            <label>Ends at</label>
            <input type="datetime-local" />
          </div>
        </form>
        <div style={{ marginTop: 18 }}>
          <button className="primary-button" type="button">Create offer</button>
        </div>
      </SectionCard>
    </div>
  );
}

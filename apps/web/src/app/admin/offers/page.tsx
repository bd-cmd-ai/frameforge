import { providerApi } from "@radar-domace/api";
import { Badge } from "../../../components/badge";
import { SectionCard } from "../../../components/section-card";

export default async function AdminOffersPage() {
  const provider = await providerApi.getProvider("provider-1");
  if (!provider) return null;

  return (
    <SectionCard title="Moderate offer posts" description="Fresh, discount, and promoted badges are all driven from this queue.">
      <table className="table">
        <thead>
          <tr>
            <th>Offer</th>
            <th>Type</th>
            <th>Window</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {provider.offers.map((offer) => (
            <tr key={offer.id}>
              <td>{offer.title.sl}</td>
              <td><Badge>{offer.type}</Badge></td>
              <td>{new Date(offer.startsAt).toLocaleDateString()} - {new Date(offer.endsAt).toLocaleDateString()}</td>
              <td><button className="ghost-button" type="button">Approve</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

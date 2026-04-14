import { providerApi } from "@radar-domace/api";
import { SectionCard } from "../../../components/section-card";

export default async function ClaimRequestsPage() {
  const claims = await providerApi.listClaimRequests();

  return (
    <SectionCard title="Claim requests" description="Admin review queue for provider ownership claims.">
      <table className="table">
        <thead>
          <tr>
            <th>Requester</th>
            <th>Email</th>
            <th>Provider</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim.id}>
              <td>{claim.requesterName}</td>
              <td>{claim.requesterEmail}</td>
              <td>{claim.providerId}</td>
              <td>{claim.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

import { providerApi } from "@radar-domace/api";
import { SectionCard } from "../../../../components/section-card";

export default async function OpeningHoursPage() {
  const provider = await providerApi.getProvider("provider-1");
  if (!provider) return null;

  return (
    <SectionCard title="Opening hours" description="Structured hours feed the Open Now badge and ranking.">
      <table className="table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Opens</th>
            <th>Closes</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {provider.openingHours.map((row) => (
            <tr key={row.id}>
              <td>{row.dayOfWeek}</td>
              <td>{row.isClosed ? "-" : row.opensAt}</td>
              <td>{row.isClosed ? "-" : row.closesAt}</td>
              <td>{row.isClosed ? "Closed" : "Open"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

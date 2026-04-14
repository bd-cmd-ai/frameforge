import { providerApi } from "@radar-domace/api";
import { SectionCard } from "../../../../components/section-card";

export default async function ProviderProfilePage() {
  const provider = await providerApi.getProvider("provider-1");
  if (!provider) return null;

  return (
    <SectionCard
      title="Edit provider profile"
      description="All public-facing copy supports Slovenian, English, German, and Italian from the start."
    >
      <form className="form-grid">
        <div className="field">
          <label>Name (SL)</label>
          <input defaultValue={provider.name.sl} />
        </div>
        <div className="field">
          <label>Name (EN)</label>
          <input defaultValue={provider.name.en} />
        </div>
        <div className="field">
          <label>Name (DE)</label>
          <input defaultValue={provider.name.de} />
        </div>
        <div className="field">
          <label>Name (IT)</label>
          <input defaultValue={provider.name.it} />
        </div>
        <div className="field full">
          <label>Short description (SL)</label>
          <textarea defaultValue={provider.shortDescription.sl} />
        </div>
        <div className="field full">
          <label>Address (SL)</label>
          <input defaultValue={provider.address.sl} />
        </div>
        <div className="field">
          <label>Latitude</label>
          <input defaultValue={provider.latitude} />
        </div>
        <div className="field">
          <label>Longitude</label>
          <input defaultValue={provider.longitude} />
        </div>
        <div className="field">
          <label>Phone</label>
          <input defaultValue={provider.phone ?? ""} />
        </div>
        <div className="field">
          <label>Website</label>
          <input defaultValue={provider.website ?? ""} />
        </div>
        <div className="field full">
          <label>Description (SL)</label>
          <textarea defaultValue={provider.description.sl} />
        </div>
      </form>
      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <button className="primary-button" type="button">Save changes</button>
        <button className="ghost-button" type="button">Preview public profile</button>
      </div>
    </SectionCard>
  );
}

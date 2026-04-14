import Image from "next/image";
import { providerApi } from "@radar-domace/api";
import { SectionCard } from "../../../../components/section-card";

export default async function ProviderImagesPage() {
  const provider = await providerApi.getProvider("provider-1");
  if (!provider) return null;

  return (
    <SectionCard title="Manage images" description="Supabase Storage is the source of truth for provider galleries.">
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {provider.images.map((image) => (
          <div key={image.id} className="table-card">
            <Image src={image.path} alt={image.alt.en} width={420} height={260} style={{ width: "100%", height: "auto", borderRadius: 18 }} />
            <p><strong>{image.alt.sl}</strong></p>
            <p className="muted">{image.isCover ? "Cover image" : "Gallery image"}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18 }}>
        <button className="primary-button" type="button">Upload new image</button>
      </div>
    </SectionCard>
  );
}

import { providerApi } from "@radar-domace/api";
import { Badge } from "../../../../components/badge";
import { SectionCard } from "../../../../components/section-card";

export default async function ProviderCategoriesPage() {
  const allCategories = await providerApi.listCategories();
  const provider = await providerApi.getProvider("provider-1");
  if (!provider) return null;

  const selected = new Set(provider.categories.map((category) => category.id));

  return (
    <SectionCard title="Manage categories" description="At least one category is required before a provider can appear in the app.">
      <div className="list">
        {allCategories.map((category) => (
          <div key={category.id} className="list-item">
            <div>
              <strong>{category.label.sl}</strong>
              <p className="muted">{category.label.en}</p>
            </div>
            {selected.has(category.id) ? <Badge>Selected</Badge> : <button className="ghost-button">Add</button>}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

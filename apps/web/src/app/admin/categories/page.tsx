import { providerApi } from "@radar-domace/api";
import { SectionCard } from "../../../components/section-card";

export default async function AdminCategoriesPage() {
  const categories = await providerApi.listCategories();

  return (
    <div className="grid two-col">
      <SectionCard title="Manage categories" description="Shared taxonomy for mobile filtering and provider classification.">
        <table className="table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>SL label</th>
              <th>EN label</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.slug}</td>
                <td>{category.label.sl}</td>
                <td>{category.label.en}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
      <SectionCard title="Add category" description="Prepared for admin-only category lifecycle management.">
        <form className="form-grid">
          <div className="field">
            <label>Slug</label>
            <input placeholder="vegetables" />
          </div>
          <div className="field">
            <label>Icon key</label>
            <input placeholder="carrot" />
          </div>
          <div className="field">
            <label>Label (SL)</label>
            <input placeholder="Zelenjava" />
          </div>
          <div className="field">
            <label>Label (EN)</label>
            <input placeholder="Vegetables" />
          </div>
        </form>
        <div style={{ marginTop: 18 }}>
          <button className="primary-button" type="button">Create category</button>
        </div>
      </SectionCard>
    </div>
  );
}

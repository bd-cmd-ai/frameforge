import Link from "next/link";
import { getAdminCategories } from "@radar-domace/api";
import { CategoryForm } from "../../../components/admin/categories/category-form";
import { EmptyState } from "../../../components/admin/empty-state";
import { ProviderSectionCard } from "../../../components/provider-portal/provider-section-card";
import { pickLocalizedText } from "../../../lib/admin/format";
import { requireRole } from "../../../lib/auth";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { supabase } = await requireRole("admin");
  const categories = await getAdminCategories(supabase);
  const editingCategory =
    typeof params.edit === "string" ? categories.find((category) => category.id === params.edit) ?? null : null;

  return (
    <div className="grid provider-two-col">
      <ProviderSectionCard title="Categories" description="Create and maintain the platform category list.">
        {categories.length === 0 ? (
          <EmptyState title="No categories yet" description="Create the first category to help classify producers." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Slovenian</th>
                <th>Icon</th>
                <th>Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.slug}</td>
                  <td>{pickLocalizedText(category.label)}</td>
                  <td>{category.icon}</td>
                  <td>{category.isActive ? "Yes" : "No"}</td>
                  <td>
                    <Link href={`/admin/categories?edit=${category.id}`} className="ghost-button">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ProviderSectionCard>

      <ProviderSectionCard title={editingCategory ? "Edit category" : "Create category"} description="Category keys should stay stable because they are reused across provider filters and cards.">
        <CategoryForm category={editingCategory} />
      </ProviderSectionCard>
    </div>
  );
}

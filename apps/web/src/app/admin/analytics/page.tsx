import { getAdminAnalyticsSummary } from "@radar-domace/api";
import { AnalyticsSummaryBlock } from "../../../components/admin/analytics-summary-block";
import { requireRole } from "../../../lib/auth";

export default async function AdminAnalyticsPage() {
  const { supabase } = await requireRole("admin");
  const analytics = await getAdminAnalyticsSummary(supabase);

  return <AnalyticsSummaryBlock analytics={analytics} />;
}

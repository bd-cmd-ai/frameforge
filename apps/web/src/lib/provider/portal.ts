import { getMyClaimRequests, getMyProvider } from "@radar-domace/api";
import { requireRole } from "../auth";

export const getProviderPortalContext = async () => {
  const auth = await requireRole("provider");
  const [provider, claims] = await Promise.all([
    getMyProvider(auth.supabase, auth.profile.id),
    getMyClaimRequests(auth.supabase, auth.profile.id),
  ]);

  const pendingClaim = claims.find((claim) => claim.status === "pending") ?? null;

  return {
    ...auth,
    provider,
    claims,
    pendingClaim,
  };
};

import { mobileEnv } from "../env";

const supabaseUrl = mobileEnv.supabaseUrl;
const bucketName = mobileEnv.providerImagesBucket;

export const resolveProviderImageUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!supabaseUrl) return undefined;

  const normalized = path.startsWith(`${bucketName}/`)
    ? path.replace(`${bucketName}/`, "")
    : path;

  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${normalized}`;
};

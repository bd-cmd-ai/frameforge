import { webEnv } from "../env";

export const PROVIDER_IMAGE_ACCEPT = ["image/jpeg", "image/png", "image/webp"];
export const PROVIDER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROVIDER_IMAGES_BUCKET = webEnv.providerImagesBucket;

export const validateProviderImageFile = (file: File) => {
  if (!PROVIDER_IMAGE_ACCEPT.includes(file.type)) {
    return "Use JPG, PNG, or WEBP images.";
  }

  if (file.size > PROVIDER_IMAGE_MAX_BYTES) {
    return "Image must be 5 MB or smaller.";
  }

  return null;
};

export const buildProviderImagePublicUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const normalized = path.startsWith(`${PROVIDER_IMAGES_BUCKET}/`)
    ? path.replace(`${PROVIDER_IMAGES_BUCKET}/`, "")
    : path;

  return `${webEnv.supabaseUrl}/storage/v1/object/public/${PROVIDER_IMAGES_BUCKET}/${normalized}`;
};

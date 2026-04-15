import type { ProviderDetail, ProductOffer } from "@radar-domace/types";

export const buildProviderChecklist = (provider: ProviderDetail, offers: ProductOffer[]) => [
  {
    key: "profile",
    label: "Profile completed",
    done:
      Boolean(provider.latitude && provider.longitude) &&
      Boolean(provider.phone || provider.email || provider.website) &&
      provider.description.sl.trim().length > 0,
  },
  {
    key: "categories",
    label: "Categories added",
    done: provider.categories.length > 0,
  },
  {
    key: "opening-hours",
    label: "Opening hours set",
    done: provider.openingHours.some((entry) => !entry.isClosed && entry.opensAt && entry.closesAt),
  },
  {
    key: "images",
    label: "Images uploaded",
    done: provider.images.length > 0,
  },
  {
    key: "offers",
    label: "First offer published",
    done: offers.length > 0,
  },
];

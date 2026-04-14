import { z } from "zod";
import type {
  AnalyticsSummary,
  ExploreFilters,
  LocalizedText,
  ProductOffer,
  ProviderCategory,
  ProviderDetail,
  ProviderSummary,
} from "@radar-domace/types";

const localizedTextSchema = z.object({
  sl: z.string(),
  en: z.string(),
  de: z.string(),
  it: z.string(),
});

export const providerCategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  label: localizedTextSchema,
  icon: z.string(),
});

export const providerSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: localizedTextSchema,
  shortDescription: localizedTextSchema,
  address: localizedTextSchema,
  latitude: z.number(),
  longitude: z.number(),
  distanceMeters: z.number(),
  isOpenNow: z.boolean(),
  isVerified: z.boolean(),
  isPromoted: z.boolean(),
  hasFreshToday: z.boolean(),
  hasDiscount: z.boolean(),
  badges: z.array(z.enum(["verified", "fresh_today", "discount", "open_now", "promoted"])),
  categories: z.array(providerCategorySchema),
  coverImage: z.string().nullable().optional(),
});

const openingHourSchema = z.object({
  id: z.string(),
  dayOfWeek: z.number(),
  opensAt: z.string(),
  closesAt: z.string(),
  isClosed: z.boolean(),
});

const providerImageSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  path: z.string(),
  isCover: z.boolean(),
  sortOrder: z.number(),
  alt: localizedTextSchema,
});

const offerSchema = z.object({
  id: z.string(),
  providerId: z.string(),
  type: z.enum(["fresh_today", "discount", "general", "promoted"]),
  title: localizedTextSchema,
  body: localizedTextSchema,
  priceLabel: z.string().nullable().optional(),
  discountPercent: z.number().nullable().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  isActive: z.boolean(),
});

export const providerDetailSchema = providerSummarySchema.extend({
  description: localizedTextSchema,
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  openingHours: z.array(openingHourSchema),
  images: z.array(providerImageSchema),
  offers: z.array(offerSchema),
});

const makeText = (sl: string, en: string, de: string, it: string): LocalizedText => ({
  sl,
  en,
  de,
  it,
});

const categories: ProviderCategory[] = [
  {
    id: "cat-dairy",
    slug: "dairy",
    label: makeText("Mlečni izdelki", "Dairy", "Molkerei", "Latticini"),
    icon: "milk",
  },
  {
    id: "cat-fruit",
    slug: "fruit",
    label: makeText("Sadje", "Fruit", "Obst", "Frutta"),
    icon: "apple",
  },
  {
    id: "cat-honey",
    slug: "honey",
    label: makeText("Med", "Honey", "Honig", "Miele"),
    icon: "flower",
  },
  {
    id: "cat-meat",
    slug: "meat",
    label: makeText("Meso", "Meat", "Fleisch", "Carne"),
    icon: "beef",
  },
];

const offers: ProductOffer[] = [
  {
    id: "offer-1",
    providerId: "provider-1",
    type: "fresh_today",
    title: makeText("Danes sveže jagode", "Fresh strawberries today", "Heute frische Erdbeeren", "Fragole fresche oggi"),
    body: makeText(
      "Nabrano danes zjutraj. Omejena količina.",
      "Picked this morning. Limited batch.",
      "Heute Morgen gepflückt. Begrenzte Menge.",
      "Raccolte stamattina. Quantità limitata.",
    ),
    priceLabel: "€4 / košarica",
    startsAt: "2026-04-14T06:00:00.000Z",
    endsAt: "2026-04-14T18:00:00.000Z",
    isActive: true,
  },
  {
    id: "offer-2",
    providerId: "provider-2",
    type: "discount",
    title: makeText("10% na kozji sir", "10% off goat cheese", "10 % auf Ziegenkäse", "10% su formaggio di capra"),
    body: makeText(
      "Popust velja do zaprtja.",
      "Discount valid until closing.",
      "Rabatt gilt bis Ladenschluss.",
      "Sconto valido fino alla chiusura.",
    ),
    discountPercent: 10,
    startsAt: "2026-04-14T08:00:00.000Z",
    endsAt: "2026-04-14T17:00:00.000Z",
    isActive: true,
  },
  {
    id: "offer-3",
    providerId: "provider-3",
    type: "promoted",
    title: makeText("Velikonočni paket", "Easter bundle", "Osterpaket", "Pacchetto di Pasqua"),
    body: makeText(
      "Domača salama, hren in kruh v enem paketu.",
      "Homemade salami, horseradish, and bread in one bundle.",
      "Hausgemachte Salami, Meerrettich und Brot im Paket.",
      "Salame artigianale, rafano e pane in un unico pacchetto.",
    ),
    startsAt: "2026-04-10T08:00:00.000Z",
    endsAt: "2026-04-18T18:00:00.000Z",
    isActive: true,
  },
];

const providers: ProviderDetail[] = [
  {
    id: "provider-1",
    slug: "sadna-kmetija-hrib",
    name: makeText("Sadna kmetija Hrib", "Hrib Fruit Farm", "Obsthof Hrib", "Fattoria della frutta Hrib"),
    shortDescription: makeText(
      "Jagode, borovnice in domači sokovi ob cesti proti Bledu.",
      "Strawberries, blueberries, and juices on the road to Bled.",
      "Erdbeeren, Heidelbeeren und Säfte auf dem Weg nach Bled.",
      "Fragole, mirtilli e succhi sulla strada per Bled.",
    ),
    description: makeText(
      "Družinska kmetija s sezonsko ponudbo sadja, sokov in marmelad.",
      "Family-run farm with seasonal fruit, juices, and jams.",
      "Familienbetrieb mit saisonalem Obst, Säften und Marmeladen.",
      "Azienda familiare con frutta stagionale, succhi e marmellate.",
    ),
    address: makeText(
      "Lancovo 24, Radovljica",
      "Lancovo 24, Radovljica",
      "Lancovo 24, Radovljica",
      "Lancovo 24, Radovljica",
    ),
    latitude: 46.3505,
    longitude: 14.1656,
    distanceMeters: 2800,
    isOpenNow: true,
    isVerified: true,
    isPromoted: false,
    hasFreshToday: true,
    hasDiscount: false,
    badges: ["verified", "fresh_today", "open_now"],
    categories: [categories[1]],
    coverImage: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
    phone: "+386 41 555 010",
    email: "info@hrib.si",
    website: "https://hrib.example.com",
    openingHours: [
      { id: "oh-11", dayOfWeek: 1, opensAt: "08:00", closesAt: "18:00", isClosed: false },
      { id: "oh-12", dayOfWeek: 2, opensAt: "08:00", closesAt: "18:00", isClosed: false },
      { id: "oh-13", dayOfWeek: 3, opensAt: "08:00", closesAt: "18:00", isClosed: false },
      { id: "oh-14", dayOfWeek: 4, opensAt: "08:00", closesAt: "18:00", isClosed: false },
      { id: "oh-15", dayOfWeek: 5, opensAt: "08:00", closesAt: "19:00", isClosed: false },
      { id: "oh-16", dayOfWeek: 6, opensAt: "08:00", closesAt: "14:00", isClosed: false },
      { id: "oh-17", dayOfWeek: 0, opensAt: "00:00", closesAt: "00:00", isClosed: true },
    ],
    images: [
      {
        id: "img-11",
        providerId: "provider-1",
        path: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
        isCover: true,
        sortOrder: 1,
        alt: makeText("Jagode na kmetiji", "Strawberries at the farm", "Erdbeeren am Hof", "Fragole in fattoria"),
      },
    ],
    offers: offers.filter((offer) => offer.providerId === "provider-1"),
  },
  {
    id: "provider-2",
    slug: "kozja-farma-zelenik",
    name: makeText("Kozja farma Zelenik", "Zelenik Goat Farm", "Ziegenhof Zelenik", "Fattoria caprina Zelenik"),
    shortDescription: makeText(
      "Sveži siri in jogurti tik ob avtocestnem izvozu.",
      "Fresh cheeses and yogurts near the highway exit.",
      "Frische Käse und Joghurts nahe der Autobahnausfahrt.",
      "Formaggi e yogurt freschi vicino all'uscita dell'autostrada.",
    ),
    description: makeText(
      "Specializirani za kozje sire, jogurte in degustacije za mimoidoče goste.",
      "Specialized in goat cheese, yogurt, and tastings for travelers.",
      "Spezialisiert auf Ziegenkäse, Joghurt und Verkostungen für Reisende.",
      "Specializzati in formaggi di capra, yogurt e degustazioni per viaggiatori.",
    ),
    address: makeText("Voklo 8, Šenčur", "Voklo 8, Šenčur", "Voklo 8, Šenčur", "Voklo 8, Šenčur"),
    latitude: 46.2454,
    longitude: 14.4281,
    distanceMeters: 6700,
    isOpenNow: true,
    isVerified: true,
    isPromoted: false,
    hasFreshToday: false,
    hasDiscount: true,
    badges: ["verified", "discount", "open_now"],
    categories: [categories[0]],
    coverImage: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
    phone: "+386 41 555 020",
    email: "hello@zelenik.si",
    website: "https://zelenik.example.com",
    openingHours: [
      { id: "oh-21", dayOfWeek: 1, opensAt: "09:00", closesAt: "17:00", isClosed: false },
      { id: "oh-22", dayOfWeek: 2, opensAt: "09:00", closesAt: "17:00", isClosed: false },
      { id: "oh-23", dayOfWeek: 3, opensAt: "09:00", closesAt: "17:00", isClosed: false },
      { id: "oh-24", dayOfWeek: 4, opensAt: "09:00", closesAt: "17:00", isClosed: false },
      { id: "oh-25", dayOfWeek: 5, opensAt: "09:00", closesAt: "17:00", isClosed: false },
      { id: "oh-26", dayOfWeek: 6, opensAt: "09:00", closesAt: "13:00", isClosed: false },
      { id: "oh-27", dayOfWeek: 0, opensAt: "00:00", closesAt: "00:00", isClosed: true },
    ],
    images: [
      {
        id: "img-21",
        providerId: "provider-2",
        path: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
        isCover: true,
        sortOrder: 1,
        alt: makeText("Kozji siri", "Goat cheeses", "Ziegenkäse", "Formaggi di capra"),
      },
    ],
    offers: offers.filter((offer) => offer.providerId === "provider-2"),
  },
  {
    id: "provider-3",
    slug: "mesarija-pri-mostu",
    name: makeText("Mesarija pri Mostu", "Bridge Butchery", "Metzgerei am Brücke", "Macelleria al Ponte"),
    shortDescription: makeText(
      "Suhe mesnine, klobase in darilni paketi.",
      "Cured meats, sausages, and gift bundles.",
      "Trockenfleisch, Würste und Geschenkpakte.",
      "Salumi, salsicce e pacchetti regalo.",
    ),
    description: makeText(
      "Tradicionalna domača mesarija z dnevno vitrino in sezonskimi paketi.",
      "Traditional butcher with a daily counter and seasonal bundles.",
      "Traditionelle Metzgerei mit Tagesvitrine und Saisonpaketen.",
      "Macelleria tradizionale con banco giornaliero e pacchetti stagionali.",
    ),
    address: makeText("Vrba 12, Žirovnica", "Vrba 12, Žirovnica", "Vrba 12, Žirovnica", "Vrba 12, Žirovnica"),
    latitude: 46.404,
    longitude: 14.1231,
    distanceMeters: 9400,
    isOpenNow: false,
    isVerified: false,
    isPromoted: true,
    hasFreshToday: false,
    hasDiscount: false,
    badges: ["promoted"],
    categories: [categories[3]],
    coverImage: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80",
    phone: "+386 41 555 030",
    email: "info@mostu.si",
    website: "https://mostu.example.com",
    openingHours: [
      { id: "oh-31", dayOfWeek: 1, opensAt: "07:00", closesAt: "15:00", isClosed: false },
      { id: "oh-32", dayOfWeek: 2, opensAt: "07:00", closesAt: "15:00", isClosed: false },
      { id: "oh-33", dayOfWeek: 3, opensAt: "07:00", closesAt: "15:00", isClosed: false },
      { id: "oh-34", dayOfWeek: 4, opensAt: "07:00", closesAt: "15:00", isClosed: false },
      { id: "oh-35", dayOfWeek: 5, opensAt: "07:00", closesAt: "15:00", isClosed: false },
      { id: "oh-36", dayOfWeek: 6, opensAt: "08:00", closesAt: "12:00", isClosed: false },
      { id: "oh-37", dayOfWeek: 0, opensAt: "00:00", closesAt: "00:00", isClosed: true },
    ],
    images: [
      {
        id: "img-31",
        providerId: "provider-3",
        path: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80",
        isCover: true,
        sortOrder: 1,
        alt: makeText("Domača mesnina", "Homemade meats", "Hausgemachte Fleischwaren", "Salumi artigianali"),
      },
    ],
    offers: offers.filter((offer) => offer.providerId === "provider-3"),
  },
];

export const demoCategories = categories;
export const demoProviders = providers;

const applyFilters = (items: ProviderDetail[], filters: ExploreFilters): ProviderDetail[] =>
  items
    .filter((provider) => provider.distanceMeters <= filters.radiusKm * 1000)
    .filter((provider) => (filters.onlyOpenNow ? provider.isOpenNow : true))
    .filter((provider) => (filters.onlyVerified ? provider.isVerified : true))
    .filter((provider) => (filters.onlyFreshToday ? provider.hasFreshToday : true))
    .filter((provider) =>
      filters.categoryIds.length > 0
        ? provider.categories.some((category) => filters.categoryIds.includes(category.id))
        : true,
    )
    .sort((a, b) => {
      if (a.distanceMeters !== b.distanceMeters) return a.distanceMeters - b.distanceMeters;
      if (a.isOpenNow !== b.isOpenNow) return Number(b.isOpenNow) - Number(a.isOpenNow);
      if (a.isVerified !== b.isVerified) return Number(b.isVerified) - Number(a.isVerified);
      if (a.hasFreshToday !== b.hasFreshToday) return Number(b.hasFreshToday) - Number(a.hasFreshToday);
      if (a.isPromoted !== b.isPromoted) return Number(b.isPromoted) - Number(a.isPromoted);
      return 0;
    });

export const providerApi = {
  async listCategories(): Promise<ProviderCategory[]> {
    return categories;
  },
  async listProviders(filters: ExploreFilters): Promise<ProviderSummary[]> {
    return applyFilters(providers, filters).map((provider) => providerSummarySchema.parse(provider));
  },
  async getProvider(providerId: string): Promise<ProviderDetail | null> {
    const provider = providers.find((entry) => entry.id === providerId) ?? null;
    return provider ? providerDetailSchema.parse(provider) : null;
  },
  async getProviderAnalytics(): Promise<AnalyticsSummary> {
    return {
      profileViews: 1284,
      navigationStarts: 183,
      favorites: 74,
      activeOffers: offers.filter((offer) => offer.isActive).length,
    };
  },
  async listClaimRequests() {
    return [
      {
        id: "claim-1",
        providerId: "provider-3",
        requesterName: "Matej Kranjc",
        requesterEmail: "matej@example.com",
        note: "I manage the butcher shop and need access to update seasonal bundles.",
        status: "pending" as const,
        createdAt: "2026-04-13T09:15:00.000Z",
      },
    ];
  },
};

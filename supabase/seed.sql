insert into public.categories (id, slug, label_i18n, icon_key, sort_order)
values
  (
    '00000000-0000-0000-0000-000000000101',
    'dairy',
    '{"sl":"Mlečni izdelki","en":"Dairy","de":"Molkerei","it":"Latticini"}',
    'milk',
    1
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'fruit',
    '{"sl":"Sadje","en":"Fruit","de":"Obst","it":"Frutta"}',
    'apple',
    2
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'honey',
    '{"sl":"Med","en":"Honey","de":"Honig","it":"Miele"}',
    'flower',
    3
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    'meat',
    '{"sl":"Meso","en":"Meat","de":"Fleisch","it":"Carne"}',
    'beef',
    4
  )
on conflict (id) do nothing;

insert into public.providers (
  id,
  slug,
  status,
  is_verified,
  verified_at,
  is_promoted,
  timezone,
  name_i18n,
  short_description_i18n,
  description_i18n,
  address_i18n,
  phone,
  email,
  website_url,
  location,
  latitude,
  longitude,
  hero_image_path
)
values
  (
    '00000000-0000-0000-0000-000000000201',
    'sadna-kmetija-hrib',
    'active',
    true,
    timezone('utc', now()),
    false,
    'Europe/Ljubljana',
    '{"sl":"Sadna kmetija Hrib","en":"Hrib Fruit Farm","de":"Obsthof Hrib","it":"Fattoria della frutta Hrib"}',
    '{"sl":"Jagode, borovnice in domači sokovi ob cesti proti Bledu.","en":"Strawberries, blueberries, and juices on the road to Bled.","de":"Erdbeeren, Heidelbeeren und Säfte auf dem Weg nach Bled.","it":"Fragole, mirtilli e succhi sulla strada per Bled."}',
    '{"sl":"Družinska kmetija s sezonsko ponudbo sadja, sokov in marmelad.","en":"Family-run farm with seasonal fruit, juices, and jams.","de":"Familienbetrieb mit saisonalem Obst, Säften und Marmeladen.","it":"Azienda familiare con frutta stagionale, succhi e marmellate."}',
    '{"sl":"Lancovo 24, Radovljica","en":"Lancovo 24, Radovljica","de":"Lancovo 24, Radovljica","it":"Lancovo 24, Radovljica"}',
    '+386 41 555 010',
    'info@hrib.si',
    'https://hrib.example.com',
    extensions.st_setsrid(extensions.st_makepoint(14.1656, 46.3505), 4326)::extensions.geography,
    46.3505,
    14.1656,
    'provider-images/hrib-cover.jpg'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'kozja-farma-zelenik',
    'active',
    true,
    timezone('utc', now()),
    false,
    'Europe/Ljubljana',
    '{"sl":"Kozja farma Zelenik","en":"Zelenik Goat Farm","de":"Ziegenhof Zelenik","it":"Fattoria caprina Zelenik"}',
    '{"sl":"Sveži siri in jogurti tik ob avtocestnem izvozu.","en":"Fresh cheeses and yogurts near the highway exit.","de":"Frische Käse und Joghurts nahe der Autobahnausfahrt.","it":"Formaggi e yogurt freschi vicino all''uscita dell''autostrada."}',
    '{"sl":"Specializirani za kozje sire, jogurte in degustacije za mimoidoče goste.","en":"Specialized in goat cheese, yogurt, and tastings for travelers.","de":"Spezialisiert auf Ziegenkäse, Joghurt und Verkostungen für Reisende.","it":"Specializzati in formaggi di capra, yogurt e degustazioni per viaggiatori."}',
    '{"sl":"Voklo 8, Šenčur","en":"Voklo 8, Šenčur","de":"Voklo 8, Šenčur","it":"Voklo 8, Šenčur"}',
    '+386 41 555 020',
    'hello@zelenik.si',
    'https://zelenik.example.com',
    extensions.st_setsrid(extensions.st_makepoint(14.4281, 46.2454), 4326)::extensions.geography,
    46.2454,
    14.4281,
    'provider-images/zelenik-cover.jpg'
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    'mesarija-pri-mostu',
    'active',
    false,
    null,
    true,
    'Europe/Ljubljana',
    '{"sl":"Mesarija pri Mostu","en":"Bridge Butchery","de":"Metzgerei am Brücke","it":"Macelleria al Ponte"}',
    '{"sl":"Suhe mesnine, klobase in darilni paketi.","en":"Cured meats, sausages, and gift bundles.","de":"Trockenfleisch, Würste und Geschenkpakete.","it":"Salumi, salsicce e pacchetti regalo."}',
    '{"sl":"Tradicionalna domača mesarija z dnevno vitrino in sezonskimi paketi.","en":"Traditional butcher with a daily counter and seasonal bundles.","de":"Traditionelle Metzgerei mit Tagesvitrine und Saisonpaketen.","it":"Macelleria tradizionale con banco giornaliero e pacchetti stagionali."}',
    '{"sl":"Vrba 12, Žirovnica","en":"Vrba 12, Žirovnica","de":"Vrba 12, Žirovnica","it":"Vrba 12, Žirovnica"}',
    '+386 41 555 030',
    'info@mostu.si',
    'https://mostu.example.com',
    extensions.st_setsrid(extensions.st_makepoint(14.1231, 46.4040), 4326)::extensions.geography,
    46.4040,
    14.1231,
    'provider-images/mostu-cover.jpg'
  )
on conflict (id) do nothing;

insert into public.provider_categories (provider_id, category_id)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000104')
on conflict do nothing;

insert into public.opening_hours (provider_id, day_of_week, opens_at, closes_at, is_closed)
values
  ('00000000-0000-0000-0000-000000000201', 1, '08:00', '18:00', false),
  ('00000000-0000-0000-0000-000000000201', 2, '08:00', '18:00', false),
  ('00000000-0000-0000-0000-000000000201', 3, '08:00', '18:00', false),
  ('00000000-0000-0000-0000-000000000201', 4, '08:00', '18:00', false),
  ('00000000-0000-0000-0000-000000000201', 5, '08:00', '19:00', false),
  ('00000000-0000-0000-0000-000000000201', 6, '08:00', '14:00', false),
  ('00000000-0000-0000-0000-000000000201', 0, null, null, true),
  ('00000000-0000-0000-0000-000000000202', 1, '09:00', '17:00', false),
  ('00000000-0000-0000-0000-000000000202', 2, '09:00', '17:00', false),
  ('00000000-0000-0000-0000-000000000202', 3, '09:00', '17:00', false),
  ('00000000-0000-0000-0000-000000000202', 4, '09:00', '17:00', false),
  ('00000000-0000-0000-0000-000000000202', 5, '09:00', '17:00', false),
  ('00000000-0000-0000-0000-000000000202', 6, '09:00', '13:00', false),
  ('00000000-0000-0000-0000-000000000202', 0, null, null, true),
  ('00000000-0000-0000-0000-000000000203', 1, '07:00', '15:00', false),
  ('00000000-0000-0000-0000-000000000203', 2, '07:00', '15:00', false),
  ('00000000-0000-0000-0000-000000000203', 3, '07:00', '15:00', false),
  ('00000000-0000-0000-0000-000000000203', 4, '07:00', '15:00', false),
  ('00000000-0000-0000-0000-000000000203', 5, '07:00', '15:00', false),
  ('00000000-0000-0000-0000-000000000203', 6, '08:00', '12:00', false),
  ('00000000-0000-0000-0000-000000000203', 0, null, null, true)
on conflict do nothing;

insert into public.provider_images (provider_id, storage_path, alt_i18n, sort_order, is_cover)
values
  (
    '00000000-0000-0000-0000-000000000201',
    'provider-images/hrib-cover.jpg',
    '{"sl":"Jagode na kmetiji","en":"Strawberries at the farm","de":"Erdbeeren am Hof","it":"Fragole in fattoria"}',
    1,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'provider-images/zelenik-cover.jpg',
    '{"sl":"Kozji siri","en":"Goat cheeses","de":"Ziegenkäse","it":"Formaggi di capra"}',
    1,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    'provider-images/mostu-cover.jpg',
    '{"sl":"Domača mesnina","en":"Homemade meats","de":"Hausgemachte Fleischwaren","it":"Salumi artigianali"}',
    1,
    true
  )
on conflict do nothing;

insert into public.product_offers (
  id,
  provider_id,
  type,
  title_i18n,
  body_i18n,
  price_label,
  discount_percent,
  starts_at,
  ends_at,
  is_active,
  is_approved,
  approved_at
)
values
  (
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000201',
    'fresh_today',
    '{"sl":"Danes sveže jagode","en":"Fresh strawberries today","de":"Heute frische Erdbeeren","it":"Fragole fresche oggi"}',
    '{"sl":"Nabrano danes zjutraj. Omejena količina.","en":"Picked this morning. Limited batch.","de":"Heute Morgen gepflückt. Begrenzte Menge.","it":"Raccolte stamattina. Quantità limitata."}',
    '€4 / košarica',
    null,
    timezone('utc', now()) - interval '6 hours',
    timezone('utc', now()) + interval '8 hours',
    true,
    true,
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000202',
    'discount',
    '{"sl":"10% na kozji sir","en":"10% off goat cheese","de":"10 % auf Ziegenkäse","it":"10% su formaggio di capra"}',
    '{"sl":"Popust velja do zaprtja.","en":"Discount valid until closing.","de":"Rabatt gilt bis Ladenschluss.","it":"Sconto valido fino alla chiusura."}',
    null,
    10,
    timezone('utc', now()) - interval '3 hours',
    timezone('utc', now()) + interval '6 hours',
    true,
    true,
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000303',
    '00000000-0000-0000-0000-000000000203',
    'promoted',
    '{"sl":"Velikonočni paket","en":"Easter bundle","de":"Osterpaket","it":"Pacchetto di Pasqua"}',
    '{"sl":"Domača salama, hren in kruh v enem paketu.","en":"Homemade salami, horseradish, and bread in one bundle.","de":"Hausgemachte Salami, Meerrettich und Brot im Paket.","it":"Salame artigianale, rafano e pane in un unico pacchetto."}',
    '€18',
    null,
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now()) + interval '4 days',
    true,
    true,
    timezone('utc', now())
  )
on conflict (id) do nothing;

insert into public.claim_requests (
  id,
  provider_id,
  requester_name,
  requester_email,
  note,
  status
)
values
  (
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000203',
    'Matej Kranjc',
    'matej@example.com',
    'I manage the butcher shop and need access to update seasonal bundles.',
    'pending'
  )
on conflict (id) do nothing;

insert into public.analytics_events (actor_role, provider_id, event_name, metadata, happened_at)
values
  ('consumer', '00000000-0000-0000-0000-000000000201', 'provider_opened', '{"source":"explore_map"}', timezone('utc', now()) - interval '2 hours'),
  ('consumer', '00000000-0000-0000-0000-000000000201', 'navigation_started', '{"source":"provider_detail"}', timezone('utc', now()) - interval '90 minutes'),
  ('consumer', '00000000-0000-0000-0000-000000000202', 'favorite_toggled', '{"state":"saved"}', timezone('utc', now()) - interval '75 minutes'),
  ('provider', '00000000-0000-0000-0000-000000000202', 'offer_created', '{"offerType":"discount"}', timezone('utc', now()) - interval '50 minutes');

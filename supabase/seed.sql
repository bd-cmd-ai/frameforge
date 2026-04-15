-- Radar Domače demo seed
-- Fake but realistic Slovenian producer data for local development and staging demos.
-- Demo account password for seeded auth users: DemoPass123!

-- Demo user ids
-- consumer: 00000000-0000-0000-0000-00000000a001
-- provider: 00000000-0000-0000-0000-00000000a002
-- claimant: 00000000-0000-0000-0000-00000000a003
-- admin:    00000000-0000-0000-0000-00000000a004

delete from public.analytics_events
where provider_id in (
  '00000000-0000-0000-0000-000000001001',
  '00000000-0000-0000-0000-000000001002',
  '00000000-0000-0000-0000-000000001003',
  '00000000-0000-0000-0000-000000001004',
  '00000000-0000-0000-0000-000000001005',
  '00000000-0000-0000-0000-000000001006',
  '00000000-0000-0000-0000-000000001007',
  '00000000-0000-0000-0000-000000001008',
  '00000000-0000-0000-0000-000000001009',
  '00000000-0000-0000-0000-000000001010',
  '00000000-0000-0000-0000-000000001011',
  '00000000-0000-0000-0000-000000001012'
)
or actor_user_id in (
  '00000000-0000-0000-0000-00000000a001',
  '00000000-0000-0000-0000-00000000a002',
  '00000000-0000-0000-0000-00000000a003',
  '00000000-0000-0000-0000-00000000a004'
);

delete from public.favorites
where user_id in (
  '00000000-0000-0000-0000-00000000a001',
  '00000000-0000-0000-0000-00000000a002',
  '00000000-0000-0000-0000-00000000a003'
);

delete from public.claim_requests
where id in (
  '00000000-0000-0000-0000-000000005001',
  '00000000-0000-0000-0000-000000005002',
  '00000000-0000-0000-0000-000000005003'
);

delete from public.product_offers
where id in (
  '00000000-0000-0000-0000-000000004001',
  '00000000-0000-0000-0000-000000004002',
  '00000000-0000-0000-0000-000000004003',
  '00000000-0000-0000-0000-000000004004',
  '00000000-0000-0000-0000-000000004005',
  '00000000-0000-0000-0000-000000004006',
  '00000000-0000-0000-0000-000000004007',
  '00000000-0000-0000-0000-000000004008'
);

delete from public.provider_images
where id in (
  '00000000-0000-0000-0000-000000002001',
  '00000000-0000-0000-0000-000000002002',
  '00000000-0000-0000-0000-000000002003',
  '00000000-0000-0000-0000-000000002004',
  '00000000-0000-0000-0000-000000002005',
  '00000000-0000-0000-0000-000000002006',
  '00000000-0000-0000-0000-000000002007',
  '00000000-0000-0000-0000-000000002008',
  '00000000-0000-0000-0000-000000002009',
  '00000000-0000-0000-0000-000000002010',
  '00000000-0000-0000-0000-000000002011',
  '00000000-0000-0000-0000-000000002012',
  '00000000-0000-0000-0000-000000002013',
  '00000000-0000-0000-0000-000000002014',
  '00000000-0000-0000-0000-000000002015',
  '00000000-0000-0000-0000-000000002016'
);

delete from public.opening_hours
where provider_id in (
  '00000000-0000-0000-0000-000000001001',
  '00000000-0000-0000-0000-000000001002',
  '00000000-0000-0000-0000-000000001003',
  '00000000-0000-0000-0000-000000001004',
  '00000000-0000-0000-0000-000000001005',
  '00000000-0000-0000-0000-000000001006',
  '00000000-0000-0000-0000-000000001007',
  '00000000-0000-0000-0000-000000001008',
  '00000000-0000-0000-0000-000000001009',
  '00000000-0000-0000-0000-000000001010',
  '00000000-0000-0000-0000-000000001011',
  '00000000-0000-0000-0000-000000001012'
);

delete from public.provider_categories
where provider_id in (
  '00000000-0000-0000-0000-000000001001',
  '00000000-0000-0000-0000-000000001002',
  '00000000-0000-0000-0000-000000001003',
  '00000000-0000-0000-0000-000000001004',
  '00000000-0000-0000-0000-000000001005',
  '00000000-0000-0000-0000-000000001006',
  '00000000-0000-0000-0000-000000001007',
  '00000000-0000-0000-0000-000000001008',
  '00000000-0000-0000-0000-000000001009',
  '00000000-0000-0000-0000-000000001010',
  '00000000-0000-0000-0000-000000001011',
  '00000000-0000-0000-0000-000000001012'
);

delete from public.providers
where id in (
  '00000000-0000-0000-0000-000000001001',
  '00000000-0000-0000-0000-000000001002',
  '00000000-0000-0000-0000-000000001003',
  '00000000-0000-0000-0000-000000001004',
  '00000000-0000-0000-0000-000000001005',
  '00000000-0000-0000-0000-000000001006',
  '00000000-0000-0000-0000-000000001007',
  '00000000-0000-0000-0000-000000001008',
  '00000000-0000-0000-0000-000000001009',
  '00000000-0000-0000-0000-000000001010',
  '00000000-0000-0000-0000-000000001011',
  '00000000-0000-0000-0000-000000001012'
);

delete from auth.identities
where user_id in (
  '00000000-0000-0000-0000-00000000a001',
  '00000000-0000-0000-0000-00000000a002',
  '00000000-0000-0000-0000-00000000a003',
  '00000000-0000-0000-0000-00000000a004'
);

delete from auth.users
where id in (
  '00000000-0000-0000-0000-00000000a001',
  '00000000-0000-0000-0000-00000000a002',
  '00000000-0000-0000-0000-00000000a003',
  '00000000-0000-0000-0000-00000000a004'
);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  is_sso_user,
  is_anonymous
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000a001',
    'authenticated',
    'authenticated',
    'consumer@demo.radardomace.local',
    extensions.crypt('DemoPass123!', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Consumer","role":"consumer","preferred_locale":"sl"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    '',
    false,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000a002',
    'authenticated',
    'authenticated',
    'provider@demo.radardomace.local',
    extensions.crypt('DemoPass123!', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Provider","role":"provider","preferred_locale":"sl"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    '',
    false,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000a003',
    'authenticated',
    'authenticated',
    'claimant@demo.radardomace.local',
    extensions.crypt('DemoPass123!', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Claimant","role":"provider","preferred_locale":"sl"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    '',
    false,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-00000000a004',
    'authenticated',
    'authenticated',
    'admin@demo.radardomace.local',
    extensions.crypt('DemoPass123!', extensions.gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Admin","role":"admin","preferred_locale":"sl"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    '',
    false,
    false
  );

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-00000000b001',
    '00000000-0000-0000-0000-00000000a001',
    '{"sub":"00000000-0000-0000-0000-00000000a001","email":"consumer@demo.radardomace.local"}',
    'email',
    'consumer@demo.radardomace.local',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-00000000b002',
    '00000000-0000-0000-0000-00000000a002',
    '{"sub":"00000000-0000-0000-0000-00000000a002","email":"provider@demo.radardomace.local"}',
    'email',
    'provider@demo.radardomace.local',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-00000000b003',
    '00000000-0000-0000-0000-00000000a003',
    '{"sub":"00000000-0000-0000-0000-00000000a003","email":"claimant@demo.radardomace.local"}',
    'email',
    'claimant@demo.radardomace.local',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-00000000b004',
    '00000000-0000-0000-0000-00000000a004',
    '{"sub":"00000000-0000-0000-0000-00000000a004","email":"admin@demo.radardomace.local"}',
    'email',
    'admin@demo.radardomace.local',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  );

insert into public.categories (id, slug, label_i18n, icon_key, sort_order, is_active)
values
  (
    '00000000-0000-0000-0000-000000000101',
    'dairy',
    '{"sl":"Mlečni izdelki","en":"Dairy","de":"Molkerei","it":"Latticini"}',
    'milk',
    1,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'fruit',
    '{"sl":"Sadje","en":"Fruit","de":"Obst","it":"Frutta"}',
    'apple',
    2,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'honey',
    '{"sl":"Med","en":"Honey","de":"Honig","it":"Miele"}',
    'flower',
    3,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    'meat',
    '{"sl":"Meso in suhomesnato","en":"Meat","de":"Fleisch","it":"Carne"}',
    'beef',
    4,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000105',
    'vegetables',
    '{"sl":"Zelenjava","en":"Vegetables","de":"Gemüse","it":"Verdura"}',
    'carrot',
    5,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000106',
    'bakery',
    '{"sl":"Pekovski izdelki","en":"Bakery","de":"Backwaren","it":"Panetteria"}',
    'bread',
    6,
    true
  )
on conflict (id) do update
set
  slug = excluded.slug,
  label_i18n = excluded.label_i18n,
  icon_key = excluded.icon_key,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

insert into public.providers (
  id,
  slug,
  owner_user_id,
  status,
  is_verified,
  verified_at,
  verified_by,
  is_promoted,
  source_type,
  source_place_id,
  promoted_until,
  timezone,
  name_i18n,
  short_description_i18n,
  description_i18n,
  address_i18n,
  phone,
  email,
  website_url,
  latitude,
  longitude,
  hero_image_path,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000001001',
    'kmetija-planika-kamnik',
    '00000000-0000-0000-0000-00000000a002',
    'active',
    true,
    timezone('utc', now()) - interval '20 days',
    '00000000-0000-0000-0000-00000000a004',
    true,
    'manual',
    null,
    timezone('utc', now()) + interval '14 days',
    'Europe/Ljubljana',
    '{"sl":"Kmetija Planika","en":"Planika Farm","de":"Bauernhof Planika","it":"Fattoria Planika"}',
    '{"sl":"Sir, jogurt in sveže mleko tik ob Kamniški Bistrici.","en":"Cheese, yogurt, and fresh milk near the Kamnik Bistrica river.","de":"Käse, Joghurt und frische Milch nahe der Kamnik Bistrica.","it":"Formaggi, yogurt e latte fresco vicino al fiume Kamniška Bistrica."}',
    '{"sl":"Družinska mlečna kmetija z majhno trgovinico ob cesti. Popotniki se radi ustavijo po mehki sir, svež jogurt in sezonske skute.","en":"Family dairy farm with a small roadside shop. Travelers stop for soft cheese, yogurt, and seasonal curd.","de":"Familienmolkerei mit kleinem Hofladen an der Straße. Reisende kommen für Weichkäse, Joghurt und Quark.","it":"Azienda lattiero-casearia familiare con piccolo punto vendita lungo la strada. I viaggiatori si fermano per formaggi molli, yogurt e ricotta."}',
    '{"sl":"Nevlje 18, Kamnik","en":"Nevlje 18, Kamnik","de":"Nevlje 18, Kamnik","it":"Nevlje 18, Kamnik"}',
    '+38640111222',
    'planika@demo.radardomace.local',
    'https://planika-demo.local',
    46.2211,
    14.6115,
    'https://placehold.co/1200x900/png?text=Kmetija+Planika',
    timezone('utc', now()) - interval '35 days',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000001002',
    'medeni-gaj-skofja-loka',
    null,
    'active',
    true,
    timezone('utc', now()) - interval '18 days',
    '00000000-0000-0000-0000-00000000a004',
    false,
    'claimed_import',
    'demo-place-medeni-gaj',
    null,
    'Europe/Ljubljana',
    '{"sl":"Medeni gaj","en":"Honey Grove","de":"Honighain","it":"Giardino del miele"}',
    '{"sl":"Cvetlični in gozdni med za izletnike na poti proti Poljanski dolini.","en":"Floral and forest honey for travelers heading into the Poljane valley.","de":"Blüten- und Waldhonig für Reisende Richtung Poljane-Tal.","it":"Miele di fiori e bosco per chi viaggia verso la valle di Poljane."}',
    '{"sl":"Čebelarska družina z degustacijami in darilnimi paketi. V sezoni imajo tudi medenjake in propolisove kapljice.","en":"Beekeeping family with tastings and gift packs. In season they also offer honey biscuits and propolis drops.","de":"Imkerfamilie mit Verkostungen und Geschenkpäckchen. In der Saison auch Honigkekse und Propolis.","it":"Famiglia di apicoltori con degustazioni e confezioni regalo. In stagione offre anche biscotti al miele e propoli."}',
    '{"sl":"Binkelj 9, Škofja Loka","en":"Binkelj 9, Škofja Loka","de":"Binkelj 9, Škofja Loka","it":"Binkelj 9, Škofja Loka"}',
    '+38640222333',
    'medeni-gaj@demo.radardomace.local',
    'https://medeni-gaj.demo.local',
    46.1659,
    14.3067,
    'https://placehold.co/1200x900/png?text=Medeni+Gaj',
    timezone('utc', now()) - interval '28 days',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000001003',
    'sadovnjak-bela-kranj',
    null,
    'active',
    false,
    null,
    null,
    false,
    'manual',
    null,
    null,
    'Europe/Ljubljana',
    '{"sl":"Sadovnjak Bela","en":"Bela Orchard","de":"Obstgarten Bela","it":"Frutteto Bela"}',
    '{"sl":"Jabolka, sokovi in suho sadje pri Kranju.","en":"Apples, juices, and dried fruit near Kranj.","de":"Äpfel, Säfte und Trockenobst bei Kranj.","it":"Mele, succhi e frutta essiccata vicino a Kranj."}',
    '{"sl":"Prijetna sadjarska točka ob regionalni cesti z zabojčki jabolk, hrušk in sezonskimi sokovi.","en":"A pleasant orchard stop along the regional road with apple crates, pears, and seasonal juices.","de":"Angenehmer Obststopp an der Regionalstraße mit Äpfeln, Birnen und saisonalen Säften.","it":"Piacevole sosta agricola lungo la strada regionale con cassette di mele, pere e succhi stagionali."}',
    '{"sl":"Predoslje 44, Kranj","en":"Predoslje 44, Kranj","de":"Predoslje 44, Kranj","it":"Predoslje 44, Kranj"}',
    '+38640333444',
    'sadovnjak-bela@demo.radardomace.local',
    'https://sadovnjak-bela.demo.local',
    46.2524,
    14.3556,
    'https://placehold.co/1200x900/png?text=Sadovnjak+Bela',
    timezone('utc', now()) - interval '24 days',
    timezone('utc', now()) - interval '3 days'
  ),
  (
    '00000000-0000-0000-0000-000000001004',
    'zeleni-rob-celje',
    null,
    'active',
    true,
    timezone('utc', now()) - interval '16 days',
    '00000000-0000-0000-0000-00000000a004',
    false,
    'google_places',
    'demo-place-zeleni-rob',
    null,
    'Europe/Ljubljana',
    '{"sl":"Zeleni rob","en":"Green Edge","de":"Grüne Kante","it":"Bordo verde"}',
    '{"sl":"Sezonska zelenjava in zelišča pri Celju.","en":"Seasonal vegetables and herbs near Celje.","de":"Saisonales Gemüse und Kräuter bei Celje.","it":"Verdura stagionale ed erbe aromatiche vicino a Celje."}',
    '{"sl":"Mali rastlinjak in samopostrežni hladilnik z dnevno svežo ponudbo. Pogosto imajo tudi pripravljene mešane zaboje.","en":"Small greenhouse and self-service fridge with daily fresh produce. Mixed produce boxes are common.","de":"Kleines Gewächshaus und Selbstbedienungskühlschrank mit täglich frischer Ware. Oft auch gemischte Kisten.","it":"Piccola serra e frigorifero self-service con prodotti freschi ogni giorno. Spesso ci sono anche cassette miste."}',
    '{"sl":"Teharje 12, Celje","en":"Teharje 12, Celje","de":"Teharje 12, Celje","it":"Teharje 12, Celje"}',
    '+38640444555',
    'zeleni-rob@demo.radardomace.local',
    null,
    46.2452,
    15.2877,
    'https://placehold.co/1200x900/png?text=Zeleni+Rob',
    timezone('utc', now()) - interval '30 days',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000001005',
    'kraska-sunka-sezana',
    null,
    'active',
    true,
    timezone('utc', now()) - interval '14 days',
    '00000000-0000-0000-0000-00000000a004',
    false,
    'manual',
    null,
    null,
    'Europe/Ljubljana',
    '{"sl":"Kraška šunka Šežana","en":"Karst Ham Sežana","de":"Karstschinken Sežana","it":"Prosciutto del Carso Sežana"}',
    '{"sl":"Suho meso in darilni narezki pred Krasom.","en":"Dry-cured meats and gift platters before the Karst plateau.","de":"Trockenfleisch und Geschenkplatten vor dem Karst.","it":"Salumi stagionati e vassoi regalo alle porte del Carso."}',
    '{"sl":"Družina pripravlja kraške suhomesnate izdelke, vakumirane pakete za na pot in degustacijske krožnike.","en":"The family prepares Karst-style cured meats, vacuum-packed travel portions, and tasting platters.","de":"Die Familie produziert Karst-Spezialitäten, vakuumierte Reiseportionen und Verkostungsplatten.","it":"La famiglia prepara salumi del Carso, confezioni sottovuoto per il viaggio e piatti degustazione."}',
    '{"sl":"Orlek 7, Sežana","en":"Orlek 7, Sežana","de":"Orlek 7, Sežana","it":"Orlek 7, Sežana"}',
    '+38640555666',
    'kraska-sunka@demo.radardomace.local',
    'https://kraska-sunka.demo.local',
    45.7094,
    13.8701,
    'https://placehold.co/1200x900/png?text=Kraska+Sunka',
    timezone('utc', now()) - interval '42 days',
    timezone('utc', now()) - interval '4 days'
  ),
  (
    '00000000-0000-0000-0000-000000001006',
    'pekarna-ob-potoku-maribor',
    null,
    'active',
    true,
    timezone('utc', now()) - interval '12 days',
    '00000000-0000-0000-0000-00000000a004',
    false,
    'manual',
    null,
    null,
    'Europe/Ljubljana',
    '{"sl":"Pekarna ob potoku","en":"Bakery by the Brook","de":"Bäckerei am Bach","it":"Panificio al ruscello"}',
    '{"sl":"Kruh iz krušne peči in jutranje potice v Mariboru.","en":"Wood-fired bread and morning sweet rolls in Maribor.","de":"Holzofenbrot und morgendliche Potica in Maribor.","it":"Pane cotto a legna e dolci del mattino a Maribor."}',
    '{"sl":"Majhna obrtna pekarna z dolgim vzhajanjem testa in sveže pečenimi hlebci že zgodaj zjutraj.","en":"Small craft bakery with slow fermentation and fresh loaves early every morning.","de":"Kleine Handwerksbäckerei mit langer Teigführung und frischen Laiben am frühen Morgen.","it":"Piccolo forno artigianale con lunga lievitazione e pagnotte sfornate di buon mattino."}',
    '{"sl":"Malečnik 21, Maribor","en":"Malečnik 21, Maribor","de":"Malečnik 21, Maribor","it":"Malečnik 21, Maribor"}',
    '+38640666777',
    'pekarna-potok@demo.radardomace.local',
    'https://pekarna-potok.demo.local',
    46.5727,
    15.6754,
    'https://placehold.co/1200x900/png?text=Pekarna+ob+Potoku',
    timezone('utc', now()) - interval '17 days',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000001007',
    'oljcni-gric-koper',
    null,
    'active',
    true,
    timezone('utc', now()) - interval '11 days',
    '00000000-0000-0000-0000-00000000a004',
    false,
    'manual',
    null,
    null,
    'Europe/Ljubljana',
    '{"sl":"Oljčni grič","en":"Olive Hill","de":"Olivenhügel","it":"Collina degli ulivi"}',
    '{"sl":"Domače vložnine, sadni namazi in darilni paketi pri Kopru.","en":"Homemade preserves, fruit spreads, and gift packs near Koper.","de":"Hausgemachte Eingelegtes, Fruchtaufstriche und Geschenkpakete bei Koper.","it":"Conserve fatte in casa, composte e confezioni regalo vicino a Capodistria."}',
    '{"sl":"Čeprav je ime po oljkah, je ponudba v MVP-ju umeščena med sadne in zelenjavne izdelke: vložene artičoke, figovi namazi in sezonski paketi.","en":"Despite the olive-inspired name, the MVP categorizes the range under fruit and vegetables: pickled artichokes, fig spreads, and seasonal packs.","de":"Trotz des Olivennamens ordnet der MVP das Sortiment Obst und Gemüse zu: eingelegte Artischocken, Feigenaufstriche und Saisonpakete.","it":"Nonostante il nome, nel MVP l''offerta rientra tra frutta e verdura: carciofi sott''olio, confetture di fichi e pacchi stagionali."}',
    '{"sl":"Šalara 31, Koper","en":"Šalara 31, Koper","de":"Šalara 31, Koper","it":"Šalara 31, Koper"}',
    '+38640777888',
    'oljcni-gric@demo.radardomace.local',
    null,
    45.5387,
    13.7426,
    'https://placehold.co/1200x900/png?text=Oljcni+Gric',
    timezone('utc', now()) - interval '21 days',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000001008',
    'sirarna-pri-jezeru-bled',
    null,
    'active',
    false,
    null,
    null,
    false,
    'manual',
    null,
    null,
    'Europe/Ljubljana',
    '{"sl":"Sirarna pri jezeru","en":"Lakeside Creamery","de":"Käserei am See","it":"Caseificio sul lago"}',
    '{"sl":"Mini sirarna za hiter postanek pri Bledu.","en":"Small creamery for a quick stop near Bled.","de":"Kleine Käserei für einen schnellen Halt bei Bled.","it":"Piccolo caseificio per una sosta rapida vicino a Bled."}',
    '{"sl":"Majhna sezonska sirarna s svežimi siri in maslom. Namenoma nima urejene celotne vsebine, da seed pokrije tudi nepopolne profile.","en":"A small seasonal creamery with fresh cheese and butter. It intentionally stays partially incomplete so the seed covers imperfect profiles too.","de":"Kleine saisonale Käserei mit Frischkäse und Butter. Absichtlich nur teilweise vollständig, damit der Seed auch unvollständige Profile abdeckt.","it":"Piccolo caseificio stagionale con formaggi freschi e burro. Rimane volutamente incompleto per coprire anche profili non perfetti nel seed."}',
    '{"sl":"Rečica 14, Bled","en":"Rečica 14, Bled","de":"Rečica 14, Bled","it":"Rečica 14, Bled"}',
    null,
    null,
    null,
    46.3791,
    14.1136,
    null,
    timezone('utc', now()) - interval '15 days',
    timezone('utc', now()) - interval '5 days'
  ),
  (
    '00000000-0000-0000-0000-000000001009',
    'vrt-pod-gradom-novo-mesto',
    null,
    'active',
    true,
    timezone('utc', now()) - interval '10 days',
    '00000000-0000-0000-0000-00000000a004',
    false,
    'manual',
    null,
    null,
    'Europe/Ljubljana',
    '{"sl":"Vrt pod gradom","en":"Garden Below the Castle","de":"Garten unter der Burg","it":"Orto sotto il castello"}',
    '{"sl":"Dnevna zelenjava in zelišča v Novem mestu.","en":"Daily vegetables and herbs in Novo Mesto.","de":"Tagesfrisches Gemüse und Kräuter in Novo Mesto.","it":"Verdura del giorno ed erbe aromatiche a Novo Mesto."}',
    '{"sl":"Ponudba za domačine in popotnike: mešane solate, sezonske jušne osnove in zeliščni šopki. Seed ga pusti brez slik za operativni health-check.","en":"A stop for locals and travelers: salad mixes, soup vegetables, and herb bundles. The seed leaves it without images for the ops checklist.","de":"Angebot für Einheimische und Reisende: Salatmischungen, Suppengemüse und Kräuterbündel. Im Seed bewusst ohne Bilder.","it":"Offerta per residenti e viaggiatori: insalate miste, verdure da brodo e mazzetti di erbe. Nel seed resta senza immagini per il controllo operativo."}',
    '{"sl":"Ždinja vas 8, Novo mesto","en":"Ždinja vas 8, Novo mesto","de":"Ždinja vas 8, Novo mesto","it":"Ždinja vas 8, Novo mesto"}',
    '+38640888999',
    null,
    null,
    45.8095,
    15.1762,
    null,
    timezone('utc', now()) - interval '13 days',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000001010',
    'domacija-mlin-ptuj',
    null,
    'pending_verification',
    false,
    null,
    null,
    false,
    'manual',
    null,
    null,
    'Europe/Ljubljana',
    '{"sl":"Domačija Mlin","en":"Mill Homestead","de":"Mühlenhof","it":"Casale del mulino"}',
    '{"sl":"Še nepreverjena domačija z izdelki iz žit in moke.","en":"Unverified homestead with grain and flour products.","de":"Noch ungeprüfter Hof mit Getreide- und Mehlprodukten.","it":"Casale non ancora verificato con prodotti a base di cereali e farine."}',
    '{"sl":"Profil čaka na potrditev lastništva. Namenjen je testiranju claim flowa in admin pregleda.","en":"This profile is waiting for an ownership review. It is meant for claim-flow and admin-review testing.","de":"Dieses Profil wartet auf die Besitzprüfung. Es dient zum Testen des Claim-Flows und der Admin-Prüfung.","it":"Questo profilo è in attesa di verifica della proprietà. Serve per testare il claim flow e la revisione admin."}',
    '{"sl":"Grajena 2, Ptuj","en":"Grajena 2, Ptuj","de":"Grajena 2, Ptuj","it":"Grajena 2, Ptuj"}',
    '+38640999001',
    'mlin@demo.radardomace.local',
    null,
    46.4211,
    15.8851,
    null,
    timezone('utc', now()) - interval '9 days',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000001011',
    'gozdni-med-kocevje',
    null,
    'suspended',
    false,
    null,
    null,
    false,
    'manual',
    null,
    null,
    'Europe/Ljubljana',
    '{"sl":"Gozdni med Kočevje","en":"Kočevje Forest Honey","de":"Waldhonig Kočevje","it":"Miele di bosco Kočevje"}',
    '{"sl":"Začasno suspendiran profil za test moderacije.","en":"Temporarily suspended profile for moderation testing.","de":"Vorübergehend suspendiertes Profil zum Testen der Moderation.","it":"Profilo temporaneamente sospeso per testare la moderazione."}',
    '{"sl":"Seed primer za suspendiran profil. Ne bi se smel pojaviti v javnem raziskovanju, ostati pa mora v admin tabelah.","en":"A seed example for a suspended profile. It should stay out of public discovery but remain visible in admin tools.","de":"Seed-Beispiel für ein suspendiertes Profil. Nicht in der öffentlichen Suche, aber in Admin-Ansichten sichtbar.","it":"Esempio seed di profilo sospeso. Non deve apparire in pubblico ma restare visibile per l''admin."}',
    '{"sl":"Mestni log 5, Kočevje","en":"Mestni log 5, Kočevje","de":"Mestni log 5, Kočevje","it":"Mestni log 5, Kočevje"}',
    '+38640101010',
    null,
    null,
    45.6424,
    14.8612,
    null,
    timezone('utc', now()) - interval '11 days',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000001012',
    'soncni-breg-murska-sobota',
    null,
    'active',
    true,
    timezone('utc', now()) - interval '8 days',
    '00000000-0000-0000-0000-00000000a004',
    false,
    'manual',
    null,
    null,
    'Europe/Ljubljana',
    '{"sl":"Sončni breg","en":"Sunny Ridge","de":"Sonnenhang","it":"Costa soleggiata"}',
    '{"sl":"Sadje in zelenjava za popotnike skozi Prekmurje.","en":"Fruit and vegetables for travelers crossing Prekmurje.","de":"Obst und Gemüse für Reisende durch Prekmurje.","it":"Frutta e verdura per chi attraversa il Prekmurje."}',
    '{"sl":"Prodajno mesto s preprostimi sezonskimi zabojčki. V seedu je namenoma javno vidno, a brez ponudb, da pokrije tudi bolj miren scenarij.","en":"A stop with simple seasonal produce boxes. In the seed it is public but currently has no offers, covering a calmer scenario.","de":"Verkaufsstelle mit einfachen Saisonkisten. Im Seed öffentlich sichtbar, aber ohne Angebote, um auch einen ruhigeren Fall abzudecken.","it":"Punto vendita con semplici cassette stagionali. Nel seed è pubblico ma senza offerte, per coprire anche uno scenario più tranquillo."}',
    '{"sl":"Markišavci 25, Murska Sobota","en":"Markišavci 25, Murska Sobota","de":"Markišavci 25, Murska Sobota","it":"Markišavci 25, Murska Sobota"}',
    '+38640121212',
    'soncni-breg@demo.radardomace.local',
    'https://soncni-breg.demo.local',
    46.6769,
    16.1666,
    'https://placehold.co/1200x900/png?text=Soncni+Breg',
    timezone('utc', now()) - interval '18 days',
    timezone('utc', now()) - interval '1 day'
  );

insert into public.provider_categories (provider_id, category_id)
values
  ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000105'),
  ('00000000-0000-0000-0000-000000001005', '00000000-0000-0000-0000-000000000104'),
  ('00000000-0000-0000-0000-000000001006', '00000000-0000-0000-0000-000000000106'),
  ('00000000-0000-0000-0000-000000001007', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000001007', '00000000-0000-0000-0000-000000000105'),
  ('00000000-0000-0000-0000-000000001008', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000001009', '00000000-0000-0000-0000-000000000105'),
  ('00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000001012', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000001012', '00000000-0000-0000-0000-000000000105');

insert into public.opening_hours (provider_id, day_of_week, opens_at, closes_at, is_closed)
select
  provider_id,
  day_of_week,
  case
    when day_of_week = 0 then null
    when provider_id = '00000000-0000-0000-0000-000000001006' then '06:30'::time
    when provider_id = '00000000-0000-0000-0000-000000001005' then '10:00'::time
    else '08:30'::time
  end,
  case
    when day_of_week = 0 then null
    when provider_id = '00000000-0000-0000-0000-000000001006' then '14:00'::time
    when provider_id = '00000000-0000-0000-0000-000000001005' then '18:00'::time
    else '17:30'::time
  end,
  day_of_week = 0
from (
  values
    ('00000000-0000-0000-0000-000000001001'::uuid),
    ('00000000-0000-0000-0000-000000001002'::uuid),
    ('00000000-0000-0000-0000-000000001003'::uuid),
    ('00000000-0000-0000-0000-000000001004'::uuid),
    ('00000000-0000-0000-0000-000000001005'::uuid),
    ('00000000-0000-0000-0000-000000001006'::uuid),
    ('00000000-0000-0000-0000-000000001007'::uuid),
    ('00000000-0000-0000-0000-000000001011'::uuid),
    ('00000000-0000-0000-0000-000000001012'::uuid)
) as providers(provider_id)
cross join (
  values (0), (1), (2), (3), (4), (5), (6)
) as weekdays(day_of_week);

insert into public.provider_images (id, provider_id, storage_path, alt_i18n, sort_order, is_cover)
values
  ('00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000001001', 'https://placehold.co/1200x900/png?text=Planika+Storefront', '{"sl":"Trgovinica kmetije Planika","en":"Planika farm shop","de":"Hofladen Planika","it":"Punto vendita Planika"}', 0, true),
  ('00000000-0000-0000-0000-000000002002', '00000000-0000-0000-0000-000000001001', 'https://placehold.co/1200x900/png?text=Planika+Cheese', '{"sl":"Sir in jogurt","en":"Cheese and yogurt","de":"Käse und Joghurt","it":"Formaggio e yogurt"}', 1, false),
  ('00000000-0000-0000-0000-000000002003', '00000000-0000-0000-0000-000000001002', 'https://placehold.co/1200x900/png?text=Medeni+Gaj+Stand', '{"sl":"Stojnica Medeni gaj","en":"Honey stand","de":"Honigstand","it":"Banco del miele"}', 0, true),
  ('00000000-0000-0000-0000-000000002004', '00000000-0000-0000-0000-000000001002', 'https://placehold.co/1200x900/png?text=Honey+Jars', '{"sl":"Kozarci medu","en":"Honey jars","de":"Honiggläser","it":"Vasetti di miele"}', 1, false),
  ('00000000-0000-0000-0000-000000002005', '00000000-0000-0000-0000-000000001003', 'https://placehold.co/1200x900/png?text=Sadovnjak+Bela', '{"sl":"Sadovnjak Bela","en":"Bela orchard","de":"Obstgarten Bela","it":"Frutteto Bela"}', 0, true),
  ('00000000-0000-0000-0000-000000002006', '00000000-0000-0000-0000-000000001004', 'https://placehold.co/1200x900/png?text=Zeleni+Rob', '{"sl":"Zeleni rob prodaja","en":"Green Edge produce stand","de":"Gemüsestand","it":"Banco ortaggi"}', 0, true),
  ('00000000-0000-0000-0000-000000002007', '00000000-0000-0000-0000-000000001005', 'https://placehold.co/1200x900/png?text=Kraska+Sunka', '{"sl":"Kraška šunka","en":"Karst ham","de":"Karstschinken","it":"Prosciutto del Carso"}', 0, true),
  ('00000000-0000-0000-0000-000000002008', '00000000-0000-0000-0000-000000001005', 'https://placehold.co/1200x900/png?text=Charcuterie+Box', '{"sl":"Darilni narezki","en":"Gift charcuterie boxes","de":"Geschenkplatten","it":"Confezioni regalo"}', 1, false),
  ('00000000-0000-0000-0000-000000002009', '00000000-0000-0000-0000-000000001006', 'https://placehold.co/1200x900/png?text=Pekarna+ob+Potoku', '{"sl":"Pekarna ob potoku","en":"Bakery by the Brook","de":"Bäckerei am Bach","it":"Panificio al ruscello"}', 0, true),
  ('00000000-0000-0000-0000-000000002010', '00000000-0000-0000-0000-000000001006', 'https://placehold.co/1200x900/png?text=Fresh+Bread', '{"sl":"Svež kruh","en":"Fresh bread","de":"Frisches Brot","it":"Pane fresco"}', 1, false),
  ('00000000-0000-0000-0000-000000002011', '00000000-0000-0000-0000-000000001007', 'https://placehold.co/1200x900/png?text=Oljcni+Gric', '{"sl":"Oljčni grič ponudba","en":"Olive Hill products","de":"Olive Hill Sortiment","it":"Prodotti di Olive Hill"}', 0, true),
  ('00000000-0000-0000-0000-000000002012', '00000000-0000-0000-0000-000000001008', 'https://placehold.co/1200x900/png?text=Sirarna+pri+Jezeru', '{"sl":"Sirarna pri jezeru","en":"Lakeside creamery","de":"Käserei am See","it":"Caseificio sul lago"}', 0, true),
  ('00000000-0000-0000-0000-000000002013', '00000000-0000-0000-0000-000000001011', 'https://placehold.co/1200x900/png?text=Gozdni+Med', '{"sl":"Gozdni med","en":"Forest honey","de":"Waldhonig","it":"Miele di bosco"}', 0, true),
  ('00000000-0000-0000-0000-000000002014', '00000000-0000-0000-0000-000000001012', 'https://placehold.co/1200x900/png?text=Soncni+Breg', '{"sl":"Sončni breg stojnica","en":"Sunny Ridge stand","de":"Stand Sonnenhang","it":"Banco Costa soleggiata"}', 0, true),
  ('00000000-0000-0000-0000-000000002015', '00000000-0000-0000-0000-000000001004', 'https://placehold.co/1200x900/png?text=Vegetable+Boxes', '{"sl":"Sezonski zaboji","en":"Seasonal produce boxes","de":"Saisonkisten","it":"Cassette stagionali"}', 1, false),
  ('00000000-0000-0000-0000-000000002016', '00000000-0000-0000-0000-000000001012', 'https://placehold.co/1200x900/png?text=Farm+Boxes', '{"sl":"Zabojčki Sončni breg","en":"Sunny Ridge produce boxes","de":"Sonnenhang Kisten","it":"Cassette Costa soleggiata"}', 1, false);

update public.providers
set hero_image_path = (
  select pi.storage_path
  from public.provider_images pi
  where pi.provider_id = providers.id
    and pi.is_cover = true
  limit 1
)
where id in (
  '00000000-0000-0000-0000-000000001001',
  '00000000-0000-0000-0000-000000001002',
  '00000000-0000-0000-0000-000000001003',
  '00000000-0000-0000-0000-000000001004',
  '00000000-0000-0000-0000-000000001005',
  '00000000-0000-0000-0000-000000001006',
  '00000000-0000-0000-0000-000000001007',
  '00000000-0000-0000-0000-000000001008',
  '00000000-0000-0000-0000-000000001011',
  '00000000-0000-0000-0000-000000001012'
);

insert into public.product_offers (
  id,
  provider_id,
  created_by,
  type,
  title_i18n,
  body_i18n,
  price_label,
  discount_percent,
  starts_at,
  ends_at,
  is_active,
  is_approved,
  approved_by,
  approved_at,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000004001',
    '00000000-0000-0000-0000-000000001001',
    '00000000-0000-0000-0000-00000000a002',
    'fresh_today',
    '{"sl":"Sveža skuta danes","en":"Fresh curd today","de":"Frischer Quark heute","it":"Ricotta fresca oggi"}',
    '{"sl":"Na voljo do razprodaje dopoldanske ture.","en":"Available until the morning batch sells out.","de":"Verfügbar bis die Vormittagscharge ausverkauft ist.","it":"Disponibile fino a esaurimento del lotto del mattino."}',
    '4.50 EUR / lonček',
    null,
    timezone('utc', now()) - interval '6 hours',
    timezone('utc', now()) + interval '18 hours',
    true,
    true,
    '00000000-0000-0000-0000-00000000a004',
    timezone('utc', now()) - interval '5 hours',
    timezone('utc', now()) - interval '8 hours',
    timezone('utc', now()) - interval '5 hours'
  ),
  (
    '00000000-0000-0000-0000-000000004002',
    '00000000-0000-0000-0000-000000001002',
    '00000000-0000-0000-0000-00000000a004',
    'discount',
    '{"sl":"15 % na cvetlični med","en":"15% off flower honey","de":"15 % auf Blütenhonig","it":"15% sul miele di fiori"}',
    '{"sl":"Popotniški vikend paket s tremi kozarci.","en":"Traveler weekend pack with three jars.","de":"Wochenendpaket für Reisende mit drei Gläsern.","it":"Pacchetto weekend per viaggiatori con tre vasetti."}',
    '12 EUR / paket',
    15,
    timezone('utc', now()) - interval '1 day',
    timezone('utc', now()) + interval '3 days',
    true,
    true,
    '00000000-0000-0000-0000-00000000a004',
    timezone('utc', now()) - interval '1 day',
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000004003',
    '00000000-0000-0000-0000-000000001004',
    null,
    'promoted',
    '{"sl":"Zeliščni zaboji za na pot","en":"Travel herb boxes","de":"Kräuterkisten für unterwegs","it":"Cassette aromatiche da viaggio"}',
    '{"sl":"Majhne škatle z baziliko, timijanom in drobnjakom.","en":"Small boxes with basil, thyme, and chives.","de":"Kleine Boxen mit Basilikum, Thymian und Schnittlauch.","it":"Piccole cassette con basilico, timo ed erba cipollina."}',
    '7 EUR / zabojček',
    null,
    timezone('utc', now()) - interval '10 hours',
    timezone('utc', now()) + interval '5 days',
    true,
    true,
    '00000000-0000-0000-0000-00000000a004',
    timezone('utc', now()) - interval '9 hours',
    timezone('utc', now()) - interval '1 day',
    timezone('utc', now()) - interval '9 hours'
  ),
  (
    '00000000-0000-0000-0000-000000004004',
    '00000000-0000-0000-0000-000000001005',
    null,
    'general',
    '{"sl":"Degustacijski krožnik","en":"Tasting platter","de":"Verkostungsplatte","it":"Piatto degustazione"}',
    '{"sl":"Na voljo vsak petek in soboto med 11. in 16. uro.","en":"Available every Friday and Saturday from 11 to 16.","de":"Jeden Freitag und Samstag von 11 bis 16 Uhr verfügbar.","it":"Disponibile ogni venerdì e sabato dalle 11 alle 16."}',
    '16 EUR / krožnik',
    null,
    timezone('utc', now()) - interval '1 day',
    timezone('utc', now()) + interval '10 days',
    true,
    true,
    '00000000-0000-0000-0000-00000000a004',
    timezone('utc', now()) - interval '1 day',
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000004005',
    '00000000-0000-0000-0000-000000001006',
    null,
    'discount',
    '{"sl":"Včerajšnji kruh po akcijski ceni","en":"Yesterday''s bread discount","de":"Rabatt auf Brot vom Vortag","it":"Sconto sul pane del giorno prima"}',
    '{"sl":"Še vedno odličen za juhe in popečence.","en":"Still great for soups and toasties.","de":"Noch immer ideal für Suppen und Toast.","it":"Ancora ottimo per zuppe e toast."}',
    '2 EUR / hlebec',
    30,
    timezone('utc', now()) - interval '4 days',
    timezone('utc', now()) + interval '1 day',
    false,
    true,
    '00000000-0000-0000-0000-00000000a004',
    timezone('utc', now()) - interval '4 days',
    timezone('utc', now()) - interval '4 days',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000004006',
    '00000000-0000-0000-0000-000000001008',
    null,
    'general',
    '{"sl":"Mehki sir za vikend goste","en":"Soft cheese for weekend guests","de":"Weichkäse für das Wochenende","it":"Formaggio morbido per il weekend"}',
    '{"sl":"Shrani osnutek za testiranje ponudb v portalu.","en":"Saved as a draft to test provider offer workflows.","de":"Als Entwurf gespeichert, um Angebots-Workflows zu testen.","it":"Salvato come bozza per testare il flusso offerte nel portale."}',
    null,
    null,
    timezone('utc', now()) + interval '2 days',
    timezone('utc', now()) + interval '7 days',
    true,
    false,
    null,
    null,
    timezone('utc', now()) - interval '1 hour',
    timezone('utc', now()) - interval '1 hour'
  ),
  (
    '00000000-0000-0000-0000-000000004007',
    '00000000-0000-0000-0000-000000001003',
    null,
    'general',
    '{"sl":"Jabolčni sok za na pot","en":"Apple juice for the road","de":"Apfelsaft für unterwegs","it":"Succo di mela da viaggio"}',
    '{"sl":"Hladen sok v povratni steklenici.","en":"Chilled juice in a returnable bottle.","de":"Gekühlter Saft in Mehrwegflasche.","it":"Succo fresco in bottiglia a rendere."}',
    '3 EUR / steklenica',
    null,
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now()) - interval '1 day',
    true,
    true,
    '00000000-0000-0000-0000-00000000a004',
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000004008',
    '00000000-0000-0000-0000-000000001012',
    null,
    'general',
    '{"sl":"Tedenski sezonski zaboj","en":"Weekly seasonal crate","de":"Wöchentliche Saisonkiste","it":"Cassetta stagionale settimanale"}',
    '{"sl":"Naročilo prevzameš isti dan med 15. in 18. uro.","en":"Pickup is available the same day between 15:00 and 18:00.","de":"Abholung am selben Tag zwischen 15 und 18 Uhr.","it":"Ritiro in giornata tra le 15 e le 18."}',
    '11 EUR / zaboj',
    null,
    timezone('utc', now()) + interval '1 day',
    timezone('utc', now()) + interval '8 days',
    true,
    true,
    '00000000-0000-0000-0000-00000000a004',
    timezone('utc', now()) - interval '2 hours',
    timezone('utc', now()) - interval '1 hour',
    timezone('utc', now()) - interval '1 hour'
  );

insert into public.favorites (user_id, provider_id, created_at)
values
  ('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-000000001001', timezone('utc', now()) - interval '4 days'),
  ('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-000000001002', timezone('utc', now()) - interval '3 days'),
  ('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-000000001004', timezone('utc', now()) - interval '2 days'),
  ('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-000000001012', timezone('utc', now()) - interval '1 day'),
  ('00000000-0000-0000-0000-00000000a003', '00000000-0000-0000-0000-000000001010', timezone('utc', now()) - interval '2 days');

insert into public.claim_requests (
  id,
  provider_id,
  requester_user_id,
  requester_name,
  requester_email,
  requester_phone,
  note,
  status,
  reviewed_by,
  reviewed_at,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000005001',
    '00000000-0000-0000-0000-000000001010',
    '00000000-0000-0000-0000-00000000a003',
    'Demo Claimant',
    'claimant@demo.radardomace.local',
    '+38641333999',
    'Vodim prodajo za to domačijo in lahko priložim dokazilo o lastništvu.',
    'pending',
    null,
    null,
    timezone('utc', now()) - interval '16 hours',
    timezone('utc', now()) - interval '16 hours'
  ),
  (
    '00000000-0000-0000-0000-000000005002',
    '00000000-0000-0000-0000-000000001001',
    '00000000-0000-0000-0000-00000000a002',
    'Demo Provider',
    'provider@demo.radardomace.local',
    '+38640112233',
    'Zgodovinski odobren zahtevek za povezavo obstoječega profila.',
    'approved',
    '00000000-0000-0000-0000-00000000a004',
    timezone('utc', now()) - interval '20 days',
    timezone('utc', now()) - interval '21 days',
    timezone('utc', now()) - interval '20 days'
  ),
  (
    '00000000-0000-0000-0000-000000005003',
    '00000000-0000-0000-0000-000000001011',
    '00000000-0000-0000-0000-00000000a003',
    'Demo Claimant',
    'claimant@demo.radardomace.local',
    '+38641333999',
    'Prepozen zahtevek za profil, ki ga trenutno ne uporabljamo več.',
    'rejected',
    '00000000-0000-0000-0000-00000000a004',
    timezone('utc', now()) - interval '6 days',
    timezone('utc', now()) - interval '7 days',
    timezone('utc', now()) - interval '6 days'
  );

insert into public.analytics_events (actor_user_id, actor_role, provider_id, event_name, metadata, happened_at)
values
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001001', 'provider_opened', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '4 days'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001001', 'provider_opened', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '3 days'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001002', 'provider_opened', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '2 days'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001004', 'provider_opened', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '1 day'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001004', 'provider_opened', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '20 hours'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001012', 'provider_opened', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '18 hours'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001001', 'navigation_started', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '3 days'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001002', 'navigation_started', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '2 days'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001004', 'navigation_started', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '22 hours'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001001', 'provider_phone_clicked', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '3 days'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001002', 'provider_website_clicked', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '2 days'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001004', 'favorite_toggled', '{"action":"added","seed":true}', timezone('utc', now()) - interval '2 days'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001012', 'favorite_toggled', '{"action":"added","seed":true}', timezone('utc', now()) - interval '1 day'),
  ('00000000-0000-0000-0000-00000000a002', 'provider', '00000000-0000-0000-0000-000000001001', 'portal_profile_saved', '{"seed":true}', timezone('utc', now()) - interval '12 days'),
  ('00000000-0000-0000-0000-00000000a002', 'provider', '00000000-0000-0000-0000-000000001001', 'offer_post_created', '{"seed":true}', timezone('utc', now()) - interval '8 days'),
  ('00000000-0000-0000-0000-00000000a002', 'provider', '00000000-0000-0000-0000-000000001001', 'offer_post_updated', '{"seed":true}', timezone('utc', now()) - interval '7 days'),
  ('00000000-0000-0000-0000-00000000a003', 'provider', '00000000-0000-0000-0000-000000001010', 'claim_request_created', '{"seed":true}', timezone('utc', now()) - interval '16 hours'),
  ('00000000-0000-0000-0000-00000000a004', 'admin', '00000000-0000-0000-0000-000000001001', 'admin_provider_verified', '{"seed":true}', timezone('utc', now()) - interval '20 days'),
  ('00000000-0000-0000-0000-00000000a004', 'admin', '00000000-0000-0000-0000-000000001010', 'admin_provider_verified', '{"seed":false,"action":"queued"}', timezone('utc', now()) - interval '1 day'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001005', 'provider_opened', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '5 hours'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001005', 'navigation_started', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '4 hours'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001005', 'provider_phone_clicked', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '4 hours'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001006', 'provider_opened', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '3 hours'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001006', 'provider_website_clicked', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '2 hours'),
  ('00000000-0000-0000-0000-00000000a001', 'consumer', '00000000-0000-0000-0000-000000001003', 'provider_opened', '{"surface":"seed","seed":true}', timezone('utc', now()) - interval '90 minutes');

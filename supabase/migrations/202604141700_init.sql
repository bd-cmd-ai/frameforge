create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('consumer', 'provider', 'admin');
create type public.provider_status as enum ('draft', 'pending_verification', 'active', 'suspended');
create type public.offer_type as enum ('fresh_today', 'discount', 'general', 'promoted');
create type public.claim_request_status as enum ('pending', 'approved', 'rejected');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'consumer',
  full_name text,
  preferred_locale text not null default 'sl',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  label_i18n jsonb not null,
  icon_key text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_label_i18n_locales check (
    label_i18n ? 'sl' and label_i18n ? 'en' and label_i18n ? 'de' and label_i18n ? 'it'
  )
);

create table if not exists public.providers (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  owner_user_id uuid references public.profiles(id) on delete set null,
  status public.provider_status not null default 'draft',
  is_verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  is_promoted boolean not null default false,
  google_place_id text,
  timezone text not null default 'Europe/Ljubljana',
  name_i18n jsonb not null,
  short_description_i18n jsonb not null default jsonb_build_object('sl', '', 'en', '', 'de', '', 'it', ''),
  description_i18n jsonb not null default jsonb_build_object('sl', '', 'en', '', 'de', '', 'it', ''),
  address_i18n jsonb not null,
  phone text,
  email text,
  website_url text,
  location extensions.geography(point, 4326),
  latitude double precision,
  longitude double precision,
  hero_image_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint providers_name_i18n_locales check (
    name_i18n ? 'sl' and name_i18n ? 'en' and name_i18n ? 'de' and name_i18n ? 'it'
  ),
  constraint providers_address_i18n_locales check (
    address_i18n ? 'sl' and address_i18n ? 'en' and address_i18n ? 'de' and address_i18n ? 'it'
  )
);

create index if not exists providers_owner_user_id_idx on public.providers(owner_user_id);
create index if not exists providers_status_idx on public.providers(status);
create index if not exists providers_location_idx on public.providers using gist(location);

create table if not exists public.provider_categories (
  provider_id uuid not null references public.providers(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (provider_id, category_id)
);

create table if not exists public.opening_hours (
  id uuid primary key default extensions.gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  day_of_week integer not null,
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint opening_hours_day_of_week check (day_of_week between 0 and 6),
  constraint opening_hours_shift_valid check (
    is_closed = true or (opens_at is not null and closes_at is not null and opens_at < closes_at)
  )
);

create unique index if not exists opening_hours_provider_day_idx
  on public.opening_hours(provider_id, day_of_week);

create table if not exists public.provider_images (
  id uuid primary key default extensions.gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  storage_path text not null,
  alt_i18n jsonb not null default jsonb_build_object('sl', '', 'en', '', 'de', '', 'it', ''),
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists provider_images_one_cover_idx
  on public.provider_images(provider_id)
  where is_cover = true;

create table if not exists public.product_offers (
  id uuid primary key default extensions.gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  type public.offer_type not null default 'general',
  title_i18n jsonb not null,
  body_i18n jsonb not null default jsonb_build_object('sl', '', 'en', '', 'de', '', 'it', ''),
  price_label text,
  discount_percent integer,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  is_approved boolean not null default false,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint product_offers_dates_valid check (starts_at < ends_at),
  constraint product_offers_discount_valid check (
    discount_percent is null or (discount_percent >= 1 and discount_percent <= 100)
  ),
  constraint product_offers_title_i18n_locales check (
    title_i18n ? 'sl' and title_i18n ? 'en' and title_i18n ? 'de' and title_i18n ? 'it'
  )
);

create index if not exists product_offers_provider_idx on public.product_offers(provider_id);
create index if not exists product_offers_active_window_idx on public.product_offers(is_active, starts_at, ends_at);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, provider_id)
);

create table if not exists public.analytics_events (
  id bigint generated by default as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_role public.app_role,
  provider_id uuid references public.providers(id) on delete set null,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  happened_at timestamptz not null default timezone('utc', now())
);

create index if not exists analytics_events_provider_idx on public.analytics_events(provider_id, happened_at desc);
create index if not exists analytics_events_event_idx on public.analytics_events(event_name, happened_at desc);

create table if not exists public.claim_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  requester_user_id uuid references public.profiles(id) on delete set null,
  requester_name text not null,
  requester_email text not null,
  note text,
  status public.claim_request_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists claim_requests_pending_unique
  on public.claim_requests(provider_id, requester_email)
  where status = 'pending';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, preferred_locale)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'consumer'),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'preferred_locale', 'sl')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.provider_meets_public_requirements(provider_row public.providers)
returns boolean
language sql
stable
as $$
  select
    provider_row.status = 'active'
    and coalesce(provider_row.name_i18n ->> 'sl', '') <> ''
    and provider_row.location is not null
    and exists (
      select 1
      from public.provider_categories pc
      where pc.provider_id = provider_row.id
    );
$$;

create or replace function public.provider_is_open_now(provider_uuid uuid, reference_ts timestamptz default timezone('utc', now()))
returns boolean
language sql
stable
as $$
  with provider_tz as (
    select timezone from public.providers where id = provider_uuid
  ),
  local_moment as (
    select
      cast(reference_ts at time zone (select timezone from provider_tz) as time) as local_time,
      extract(dow from reference_ts at time zone (select timezone from provider_tz))::integer as local_day
  )
  select exists (
    select 1
    from public.opening_hours oh
    join local_moment lm on true
    where oh.provider_id = provider_uuid
      and oh.day_of_week = lm.local_day
      and oh.is_closed = false
      and lm.local_time >= oh.opens_at
      and lm.local_time <= oh.closes_at
  );
$$;

create or replace function public.provider_has_active_offer(
  provider_uuid uuid,
  offer_kind public.offer_type default null,
  reference_ts timestamptz default timezone('utc', now())
)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.product_offers po
    where po.provider_id = provider_uuid
      and po.is_active = true
      and po.is_approved = true
      and reference_ts between po.starts_at and po.ends_at
      and (offer_kind is null or po.type = offer_kind)
  );
$$;

create or replace view public.provider_public_cards as
select
  p.id,
  p.slug,
  p.name_i18n,
  p.short_description_i18n,
  p.address_i18n,
  p.latitude,
  p.longitude,
  p.hero_image_path,
  p.is_verified,
  p.is_promoted,
  public.provider_is_open_now(p.id) as is_open_now,
  public.provider_has_active_offer(p.id, 'fresh_today') as has_fresh_today,
  public.provider_has_active_offer(p.id, 'discount') as has_discount,
  array_remove(array[
    case when p.is_verified then 'verified' end,
    case when public.provider_has_active_offer(p.id, 'fresh_today') then 'fresh_today' end,
    case when public.provider_has_active_offer(p.id, 'discount') then 'discount' end,
    case when public.provider_is_open_now(p.id) then 'open_now' end,
    case when p.is_promoted or public.provider_has_active_offer(p.id, 'promoted') then 'promoted' end
  ], null) as badges
from public.providers p
where public.provider_meets_public_requirements(p);

create or replace function public.search_providers(
  search_lat double precision,
  search_lng double precision,
  radius_meters integer default 15000,
  category_ids uuid[] default null,
  only_open_now boolean default false,
  only_verified boolean default false,
  only_fresh_today boolean default false,
  result_limit integer default 100
)
returns table (
  id uuid,
  slug text,
  name_i18n jsonb,
  short_description_i18n jsonb,
  address_i18n jsonb,
  latitude double precision,
  longitude double precision,
  distance_meters double precision,
  is_open_now boolean,
  is_verified boolean,
  is_promoted boolean,
  has_fresh_today boolean,
  has_discount boolean,
  badges text[],
  hero_image_path text
)
language sql
stable
as $$
  with origin as (
    select extensions.st_setsrid(extensions.st_makepoint(search_lng, search_lat), 4326)::extensions.geography as point
  ),
  base as (
    select
      card.*,
      extensions.st_distance(
        p.location,
        (select point from origin)
      ) as distance_meters
    from public.provider_public_cards card
    join public.providers p on p.id = card.id
    where p.location is not null
      and extensions.st_dwithin(p.location, (select point from origin), radius_meters)
      and (
        category_ids is null
        or exists (
          select 1 from public.provider_categories pc
          where pc.provider_id = p.id
            and pc.category_id = any(category_ids)
        )
      )
      and (only_open_now = false or card.is_open_now = true)
      and (only_verified = false or card.is_verified = true)
      and (only_fresh_today = false or card.has_fresh_today = true)
  )
  select
    id,
    slug,
    name_i18n,
    short_description_i18n,
    address_i18n,
    latitude,
    longitude,
    distance_meters,
    is_open_now,
    is_verified,
    is_promoted,
    has_fresh_today,
    has_discount,
    badges,
    hero_image_path
  from base
  order by
    distance_meters asc,
    is_open_now desc,
    is_verified desc,
    has_fresh_today desc,
    is_promoted desc
  limit result_limit;
$$;

insert into storage.buckets (id, name, public)
values ('provider-images', 'provider-images', true)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.providers enable row level security;
alter table public.provider_categories enable row level security;
alter table public.opening_hours enable row level security;
alter table public.provider_images enable row level security;
alter table public.product_offers enable row level security;
alter table public.favorites enable row level security;
alter table public.analytics_events enable row level security;
alter table public.claim_requests enable row level security;

create policy "public can read active categories"
on public.categories
for select
using (is_active = true);

create policy "public can read public provider cards"
on public.providers
for select
using (public.provider_meets_public_requirements(providers));

create policy "providers and admins can read owned provider rows"
on public.providers
for select
using (
  auth.uid() = owner_user_id
  or exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role = 'admin'
  )
);

create policy "providers can update owned providers"
on public.providers
for update
using (
  auth.uid() = owner_user_id
  or exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role = 'admin'
  )
)
with check (
  auth.uid() = owner_user_id
  or exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role = 'admin'
  )
);

create policy "admins can insert providers"
on public.providers
for insert
with check (
  exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role = 'admin'
  )
);

create policy "public can read provider categories"
on public.provider_categories
for select
using (
  exists (
    select 1 from public.providers p
    where p.id = provider_id
      and public.provider_meets_public_requirements(p)
  )
);

create policy "owners and admins manage provider categories"
on public.provider_categories
for all
using (
  exists (
    select 1 from public.providers p
    where p.id = provider_id
      and (
        p.owner_user_id = auth.uid()
        or exists (
          select 1 from public.profiles pr
          where pr.id = auth.uid() and pr.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1 from public.providers p
    where p.id = provider_id
      and (
        p.owner_user_id = auth.uid()
        or exists (
          select 1 from public.profiles pr
          where pr.id = auth.uid() and pr.role = 'admin'
        )
      )
  )
);

create policy "public can read opening hours"
on public.opening_hours
for select
using (
  exists (
    select 1 from public.providers p
    where p.id = provider_id
      and public.provider_meets_public_requirements(p)
  )
);

create policy "owners and admins manage opening hours"
on public.opening_hours
for all
using (
  exists (
    select 1 from public.providers p
    where p.id = provider_id
      and (
        p.owner_user_id = auth.uid()
        or exists (
          select 1 from public.profiles pr
          where pr.id = auth.uid() and pr.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1 from public.providers p
    where p.id = provider_id
      and (
        p.owner_user_id = auth.uid()
        or exists (
          select 1 from public.profiles pr
          where pr.id = auth.uid() and pr.role = 'admin'
        )
      )
  )
);

create policy "public can read provider images"
on public.provider_images
for select
using (
  exists (
    select 1 from public.providers p
    where p.id = provider_id
      and public.provider_meets_public_requirements(p)
  )
);

create policy "owners and admins manage provider images"
on public.provider_images
for all
using (
  exists (
    select 1 from public.providers p
    where p.id = provider_id
      and (
        p.owner_user_id = auth.uid()
        or exists (
          select 1 from public.profiles pr
          where pr.id = auth.uid() and pr.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1 from public.providers p
    where p.id = provider_id
      and (
        p.owner_user_id = auth.uid()
        or exists (
          select 1 from public.profiles pr
          where pr.id = auth.uid() and pr.role = 'admin'
        )
      )
  )
);

create policy "public can read approved offers for public providers"
on public.product_offers
for select
using (
  is_active = true
  and is_approved = true
  and exists (
    select 1 from public.providers p
    where p.id = provider_id
      and public.provider_meets_public_requirements(p)
  )
);

create policy "owners and admins manage offers"
on public.product_offers
for all
using (
  exists (
    select 1 from public.providers p
    where p.id = provider_id
      and (
        p.owner_user_id = auth.uid()
        or exists (
          select 1 from public.profiles pr
          where pr.id = auth.uid() and pr.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1 from public.providers p
    where p.id = provider_id
      and (
        p.owner_user_id = auth.uid()
        or exists (
          select 1 from public.profiles pr
          where pr.id = auth.uid() and pr.role = 'admin'
        )
      )
  )
);

create policy "users manage own favorites"
on public.favorites
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "authenticated users can insert analytics"
on public.analytics_events
for insert
with check (auth.uid() is not null);

create policy "providers and admins read relevant analytics"
on public.analytics_events
for select
using (
  exists (
    select 1
    from public.providers p
    where p.id = analytics_events.provider_id
      and (
        p.owner_user_id = auth.uid()
        or exists (
          select 1 from public.profiles pr
          where pr.id = auth.uid() and pr.role = 'admin'
        )
      )
  )
);

create policy "authenticated users can create claim requests"
on public.claim_requests
for insert
with check (auth.uid() = requester_user_id or requester_user_id is null);

create policy "admins can read and update claim requests"
on public.claim_requests
for select
using (
  exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role = 'admin'
  )
);

create policy "admins can update claim requests"
on public.claim_requests
for update
using (
  exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role = 'admin'
  )
);

create policy "users read own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "users update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "admins read all profiles"
on public.profiles
for select
using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles pr
    where pr.id = auth.uid() and pr.role = 'admin'
  )
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute procedure public.set_updated_at();

create trigger providers_set_updated_at
before update on public.providers
for each row execute procedure public.set_updated_at();

create trigger opening_hours_set_updated_at
before update on public.opening_hours
for each row execute procedure public.set_updated_at();

create trigger provider_images_set_updated_at
before update on public.provider_images
for each row execute procedure public.set_updated_at();

create trigger product_offers_set_updated_at
before update on public.product_offers
for each row execute procedure public.set_updated_at();

create trigger claim_requests_set_updated_at
before update on public.claim_requests
for each row execute procedure public.set_updated_at();

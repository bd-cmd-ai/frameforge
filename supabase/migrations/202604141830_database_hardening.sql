create extension if not exists btree_gist with schema extensions;
create extension if not exists citext with schema extensions;

do $$
begin
  create type public.provider_source_type as enum ('manual', 'google_places', 'claimed_import');
exception
  when duplicate_object then null;
end
$$;

create or replace function public.localized_i18n_complete(payload jsonb)
returns boolean
language sql
immutable
parallel safe
as $$
  select
    jsonb_typeof(payload) = 'object'
    and payload ?& array['sl', 'en', 'de', 'it'];
$$;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'admin', false);
$$;

create or replace function public.provider_is_managed_by_current_user(provider_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.providers p
    where p.id = provider_uuid
      and (
        p.owner_user_id = auth.uid()
        or public.is_admin()
      )
  );
$$;

create or replace function public.provider_is_public(provider_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.providers p
    where p.id = provider_uuid
      and public.provider_meets_public_requirements(p)
  );
$$;

create or replace function public.provider_is_currently_promoted(
  provider_uuid uuid,
  reference_ts timestamptz default timezone('utc', now())
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.providers p
    where p.id = provider_uuid
      and p.is_promoted = true
      and (p.promoted_until is null or p.promoted_until >= reference_ts)
  );
$$;

create or replace function public.provider_is_open_now(
  provider_uuid uuid,
  reference_ts timestamptz default timezone('utc', now())
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with provider_tz as (
    select timezone
    from public.providers
    where id = provider_uuid
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
security definer
set search_path = public
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

create or replace function public.sync_provider_location()
returns trigger
language plpgsql
as $$
begin
  if new.latitude is null or new.longitude is null then
    new.latitude := null;
    new.longitude := null;
    new.location := null;
  else
    new.location := extensions.st_setsrid(
      extensions.st_makepoint(new.longitude, new.latitude),
      4326
    )::extensions.geography;
  end if;

  return new;
end;
$$;

alter table public.profiles
  add column if not exists email extensions.citext;

update public.profiles p
set email = u.email::extensions.citext
from auth.users u
where u.id = p.id
  and p.email is distinct from u.email::extensions.citext;

create unique index if not exists profiles_email_unique_idx
  on public.profiles(email)
  where email is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_preferred_locale_valid'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_preferred_locale_valid
      check (preferred_locale in ('sl', 'en', 'de', 'it'));
  end if;
end
$$;

alter table public.providers
  add column if not exists source_type public.provider_source_type not null default 'manual',
  add column if not exists promoted_until timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'providers'
      and column_name = 'google_place_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'providers'
      and column_name = 'source_place_id'
  ) then
    alter table public.providers rename column google_place_id to source_place_id;
  end if;
end
$$;

alter table public.providers
  alter column email type extensions.citext using email::extensions.citext;

update public.providers
set location = extensions.st_setsrid(
  extensions.st_makepoint(longitude, latitude),
  4326
)::extensions.geography
where latitude is not null
  and longitude is not null
  and location is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'providers_coordinates_valid'
      and conrelid = 'public.providers'::regclass
  ) then
    alter table public.providers
      add constraint providers_coordinates_valid
      check (
        (
          latitude is null
          and longitude is null
          and location is null
        )
        or (
          latitude between -90 and 90
          and longitude between -180 and 180
          and location is not null
        )
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'providers_short_description_i18n_locales'
      and conrelid = 'public.providers'::regclass
  ) then
    alter table public.providers
      add constraint providers_short_description_i18n_locales
      check (public.localized_i18n_complete(short_description_i18n));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'providers_description_i18n_locales'
      and conrelid = 'public.providers'::regclass
  ) then
    alter table public.providers
      add constraint providers_description_i18n_locales
      check (public.localized_i18n_complete(description_i18n));
  end if;
end
$$;

create index if not exists providers_public_discovery_idx
  on public.providers(status, is_verified, promoted_until)
  where location is not null;

create index if not exists providers_source_place_idx
  on public.providers(source_type, source_place_id)
  where source_place_id is not null;

create index if not exists provider_categories_category_provider_idx
  on public.provider_categories(category_id, provider_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'provider_images_alt_i18n_locales'
      and conrelid = 'public.provider_images'::regclass
  ) then
    alter table public.provider_images
      add constraint provider_images_alt_i18n_locales
      check (public.localized_i18n_complete(alt_i18n));
  end if;
end
$$;

create unique index if not exists provider_images_provider_sort_unique_idx
  on public.provider_images(provider_id, sort_order);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'product_offers_body_i18n_locales'
      and conrelid = 'public.product_offers'::regclass
  ) then
    alter table public.product_offers
      add constraint product_offers_body_i18n_locales
      check (public.localized_i18n_complete(body_i18n));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'product_offers_discount_type_requires_percent'
      and conrelid = 'public.product_offers'::regclass
  ) then
    alter table public.product_offers
      add constraint product_offers_discount_type_requires_percent
      check (type <> 'discount' or discount_percent is not null);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'product_offers_approval_consistency'
      and conrelid = 'public.product_offers'::regclass
  ) then
    alter table public.product_offers
      add constraint product_offers_approval_consistency
      check (
        (is_approved = false and approved_at is null and approved_by is null)
        or (is_approved = true and approved_at is not null and approved_by is not null)
      );
  end if;
end
$$;

create index if not exists product_offers_active_discovery_idx
  on public.product_offers(provider_id, starts_at, ends_at)
  where is_active = true and is_approved = true;

create index if not exists product_offers_window_gist_idx
  on public.product_offers
  using gist (provider_id, tstzrange(starts_at, ends_at, '[]'))
  where is_active = true and is_approved = true;

create index if not exists favorites_provider_idx
  on public.favorites(provider_id);

create index if not exists analytics_events_actor_idx
  on public.analytics_events(actor_user_id, happened_at desc);

alter table public.claim_requests
  add column if not exists requester_phone text;

alter table public.claim_requests
  alter column requester_email type extensions.citext using requester_email::extensions.citext;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'claim_requests_review_consistency'
      and conrelid = 'public.claim_requests'::regclass
  ) then
    alter table public.claim_requests
      add constraint claim_requests_review_consistency
      check (
        (status = 'pending' and reviewed_by is null and reviewed_at is null)
        or (status in ('approved', 'rejected') and reviewed_by is not null and reviewed_at is not null)
      );
  end if;
end
$$;

create index if not exists claim_requests_status_created_idx
  on public.claim_requests(status, created_at desc);

create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name, preferred_locale)
  values (
    new.id,
    new.email::extensions.citext,
    case
      when new.raw_user_meta_data ->> 'role' in ('consumer', 'provider', 'admin')
        then (new.raw_user_meta_data ->> 'role')::public.app_role
      else 'consumer'::public.app_role
    end,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'preferred_locale' in ('sl', 'en', 'de', 'it')
        then new.raw_user_meta_data ->> 'preferred_locale'
      else 'sl'
    end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = case
          when excluded.full_name <> '' then excluded.full_name
          else public.profiles.full_name
        end,
        preferred_locale = case
          when excluded.preferred_locale in ('sl', 'en', 'de', 'it') then excluded.preferred_locale
          else public.profiles.preferred_locale
        end,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.provider_meets_public_requirements(provider_row public.providers)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    provider_row.status = 'active'
    and coalesce(btrim(provider_row.name_i18n ->> 'sl'), '') <> ''
    and provider_row.latitude is not null
    and provider_row.longitude is not null
    and provider_row.location is not null
    and exists (
      select 1
      from public.provider_categories pc
      join public.categories c on c.id = pc.category_id
      where pc.provider_id = provider_row.id
        and c.is_active = true
    );
$$;

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
security definer
set search_path = public, extensions
as $$
  with origin as (
    select extensions.st_setsrid(extensions.st_makepoint(search_lng, search_lat), 4326)::extensions.geography as point
  ),
  base as (
    select
      card.*,
      extensions.st_distance(p.location, (select point from origin)) as distance_meters
    from public.provider_public_cards card
    join public.providers p on p.id = card.id
    where p.location is not null
      and extensions.st_dwithin(p.location, (select point from origin), radius_meters)
      and (
        category_ids is null
        or exists (
          select 1
          from public.provider_categories pc
          join public.categories c on c.id = pc.category_id
          where pc.provider_id = p.id
            and pc.category_id = any(category_ids)
            and c.is_active = true
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

create or replace view public.provider_public_cards
with (security_barrier = true)
as
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
  public.provider_is_currently_promoted(p.id) as is_promoted,
  public.provider_is_open_now(p.id) as is_open_now,
  public.provider_has_active_offer(p.id, 'fresh_today') as has_fresh_today,
  public.provider_has_active_offer(p.id, 'discount') as has_discount,
  array_remove(array[
    case when p.is_verified then 'verified' end,
    case when public.provider_has_active_offer(p.id, 'fresh_today') then 'fresh_today' end,
    case when public.provider_has_active_offer(p.id, 'discount') then 'discount' end,
    case when public.provider_is_open_now(p.id) then 'open_now' end,
    case when public.provider_is_currently_promoted(p.id) or public.provider_has_active_offer(p.id, 'promoted') then 'promoted' end
  ], null) as badges
from public.providers p
where public.provider_meets_public_requirements(p);

create or replace view public.provider_public_profiles
with (security_barrier = true)
as
select
  p.id,
  p.slug,
  p.name_i18n,
  p.short_description_i18n,
  p.description_i18n,
  p.address_i18n,
  p.phone,
  p.email,
  p.website_url,
  p.latitude,
  p.longitude,
  p.hero_image_path,
  p.is_verified,
  public.provider_is_currently_promoted(p.id) as is_promoted,
  public.provider_is_open_now(p.id) as is_open_now,
  public.provider_has_active_offer(p.id, 'fresh_today') as has_fresh_today,
  public.provider_has_active_offer(p.id, 'discount') as has_discount
from public.providers p
where public.provider_meets_public_requirements(p);

grant select on public.provider_public_cards to anon, authenticated;
grant select on public.provider_public_profiles to anon, authenticated;
grant execute on function public.search_providers(double precision, double precision, integer, uuid[], boolean, boolean, boolean, integer) to anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_synced on auth.users;
create trigger on_auth_user_synced
after insert or update of email, raw_user_meta_data on auth.users
for each row execute procedure public.sync_profile_from_auth_user();

drop trigger if exists providers_sync_location on public.providers;
create trigger providers_sync_location
before insert or update of latitude, longitude on public.providers
for each row execute procedure public.sync_provider_location();

drop policy if exists "public can read public provider cards" on public.providers;

drop policy if exists "public can read provider categories" on public.provider_categories;
create policy "public can read provider categories"
on public.provider_categories
for select
using (public.provider_is_public(provider_id));

drop policy if exists "public can read opening hours" on public.opening_hours;
create policy "public can read opening hours"
on public.opening_hours
for select
using (public.provider_is_public(provider_id));

drop policy if exists "public can read provider images" on public.provider_images;
create policy "public can read provider images"
on public.provider_images
for select
using (public.provider_is_public(provider_id));

drop policy if exists "public can read approved offers for public providers" on public.product_offers;
create policy "public can read approved offers for public providers"
on public.product_offers
for select
using (
  public.provider_is_public(provider_id)
  and is_active = true
  and is_approved = true
  and timezone('utc', now()) between starts_at and ends_at
);

drop policy if exists "providers and admins can read owned provider rows" on public.providers;
create policy "providers and admins can read managed provider rows"
on public.providers
for select
using (public.provider_is_managed_by_current_user(id));

drop policy if exists "providers can update owned providers" on public.providers;
create policy "providers and admins can update managed providers"
on public.providers
for update
using (public.provider_is_managed_by_current_user(id))
with check (public.provider_is_managed_by_current_user(id));

create policy "admins can delete providers"
on public.providers
for delete
using (public.is_admin());

create policy "admins can manage categories"
on public.categories
for all
using (public.is_admin())
with check (public.is_admin());

create policy "admins can update profiles"
on public.profiles
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "providers and admins read relevant analytics" on public.analytics_events;
create policy "providers and admins read relevant analytics"
on public.analytics_events
for select
using (
  public.is_admin()
  or (
    provider_id is not null
    and public.provider_is_managed_by_current_user(provider_id)
  )
);

create policy "users can read own claim requests"
on public.claim_requests
for select
using (requester_user_id = auth.uid());

grant execute on function public.provider_is_open_now(uuid, timestamptz) to anon, authenticated;
grant execute on function public.provider_has_active_offer(uuid, public.offer_type, timestamptz) to anon, authenticated;

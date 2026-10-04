-- ============================================================================
-- Colours Matter: Supabase schema
--
-- Run this whole file in your Supabase project (SQL Editor → New query →
-- paste → Run). It is safe to run again, and it upgrades the earlier
-- "likes / comments / shared_places / taste_results" tables automatically. Then put the project URL and anon key in js/data/config.js
-- (src/data/config.js in the source project).
--
-- Security model
--   * Row-level security (RLS) is enabled on every table.
--   * Visitors (the "anon" role) can only READ public columns. They cannot
--     insert, update or delete rows directly.
--   * All writes go through SECURITY DEFINER functions below, which clean the
--     input, validate it and apply rate limits before inserting.
--   * Rate limits are keyed on a hash of the visitor's IP address (taken from
--     the request headers Supabase forwards), falling back to a client id.
--   * Photos go to a public "places" bucket that only accepts JPEG files up to
--     2 MB with a random UUID file name, with a global upload throttle.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Upgrade from an earlier, different version of these tables
-- (columns target_id / author / content, food_id / condition, shared_places).
-- Empty old tables are removed. Old tables that already contain rows are
-- renamed to *_old_v0 (nothing is deleted) and lose their public policies.
-- ---------------------------------------------------------------------------
do $$
declare
  t record;
  has_rows boolean;
  stmt text;
begin
  for t in
    select * from (values
      ('likes', 'target_id'),
      ('comments', 'target_id'),
      ('taste_results', 'food_id'),
      ('shared_places', 'title')
    ) as v(tbl, marker)
  loop
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t.tbl and column_name = t.marker
    ) then
      execute format('select exists (select 1 from public.%I)', t.tbl) into has_rows;
      if has_rows then
        execute format('alter table public.%I rename to %I', t.tbl, t.tbl || '_old_v0');
        execute format('revoke all on public.%I from anon, authenticated', t.tbl || '_old_v0');
        select coalesce(string_agg(format('drop policy %I on public.%I;', policyname, t.tbl || '_old_v0'), ' '), '')
          into stmt from pg_policies where schemaname = 'public' and tablename = t.tbl || '_old_v0';
        if stmt <> '' then
          execute stmt;
        end if;
        raise notice 'Kept existing data: public.% renamed to public.%_old_v0', t.tbl, t.tbl;
      else
        execute format('drop table public.%I cascade', t.tbl);
        raise notice 'Removed empty old table public.%', t.tbl;
      end if;
    end if;
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null check (post_id ~ '^[a-z0-9-]{1,80}$'),
  name text not null check (char_length(name) between 1 and 30),
  body text not null check (char_length(body) between 2 and 400),
  client_id text not null check (char_length(client_id) between 8 and 64),
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, created_at);

create table if not exists public.likes (
  post_id text not null check (post_id ~ '^[a-z0-9-]{1,80}$'),
  client_id text not null check (char_length(client_id) between 8 and 64),
  created_at timestamptz not null default now(),
  primary key (post_id, client_id)
);

create or replace function private.valid_hex_array(arr text[])
returns boolean language sql immutable as $$
  select coalesce(bool_and(c ~ '^#[0-9a-fA-F]{6}$'), false) from unnest(arr) as c
$$;

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 60),
  location text not null check (char_length(location) between 1 and 60),
  feeling text not null check (char_length(feeling) between 1 and 300),
  description text not null check (char_length(description) <= 400),
  author text not null check (char_length(author) between 1 and 30),
  colours text[] not null check (array_length(colours, 1) between 3 and 5 and private.valid_hex_array(colours)),
  moods text[] not null default '{}' check (coalesce(array_length(moods, 1), 0) <= 3),
  image_path text check (image_path ~ '^[0-9a-f-]{36}\.jpg$'),
  width int check (width between 1 and 4000),
  height int check (height between 1 and 4000),
  client_id text not null check (char_length(client_id) between 8 and 64),
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists places_created_idx on public.places (created_at desc);

create table if not exists public.taste_results (
  id uuid primary key default gen_random_uuid(),
  food text not null check (food in ('rice', 'milk', 'eggs', 'hummus', 'pancakes')),
  tester text not null check (char_length(tester) between 1 and 30),
  mode text not null check (mode in ('visual', 'blind')),
  look smallint check (look between 1 and 5),
  taste smallint not null check (taste between 1 and 5),
  different text not null check (different in ('yes', 'no', 'unsure')),
  reaction text not null check (char_length(reaction) <= 8),
  comment text not null default '' check (char_length(comment) <= 240),
  client_id text not null check (char_length(client_id) between 8 and 64),
  ip_hash text,
  created_at timestamptz not null default now(),
  check ((mode = 'blind' and look is null) or (mode = 'visual' and look is not null))
);
create index if not exists taste_created_idx on public.taste_results (created_at desc);

create table if not exists private.rate_events (
  kind text not null,
  key text not null,
  at timestamptz not null default now()
);
create index if not exists rate_events_idx on private.rate_events (kind, key, at);

-- ---------------------------------------------------------------------------
-- Row-level security and column privileges
-- ---------------------------------------------------------------------------

alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.places enable row level security;
alter table public.taste_results enable row level security;

drop policy if exists "Anyone can read comments" on public.comments;
create policy "Anyone can read comments" on public.comments for select to anon, authenticated using (true);
drop policy if exists "Anyone can read places" on public.places;
create policy "Anyone can read places" on public.places for select to anon, authenticated using (true);
drop policy if exists "Anyone can read taste results" on public.taste_results;
create policy "Anyone can read taste results" on public.taste_results for select to anon, authenticated using (true);
-- likes: no policies, so no direct access at all (counts come from functions).

revoke all on public.comments, public.likes, public.places, public.taste_results from anon, authenticated;
grant select (id, post_id, name, body, created_at) on public.comments to anon, authenticated;
grant select (id, title, location, feeling, description, author, colours, moods, image_path, width, height, created_at)
  on public.places to anon, authenticated;
grant select (id, food, tester, mode, look, taste, different, reaction, comment, created_at)
  on public.taste_results to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Private helpers
-- ---------------------------------------------------------------------------

-- Hash of the caller's IP (first x-forwarded-for entry), or of the client id.
create or replace function private.request_key(p_client_id text)
returns text language sql stable as $$
  select encode(
    extensions.digest(
      coalesce(
        nullif(btrim(split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1)), ''),
        'client:' || coalesce(p_client_id, '')
      ),
      'sha256'
    ),
    'hex'
  )
$$;

create or replace function private.enforce_rate(p_kind text, p_key text, p_max int, p_window interval)
returns void language plpgsql as $$
declare
  n int;
begin
  delete from private.rate_events where at < now() - interval '1 day';
  select count(*) into n from private.rate_events
    where kind = p_kind and key = p_key and at > now() - p_window;
  if n >= p_max then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Please wait a moment and try again.';
  end if;
  insert into private.rate_events (kind, key) values (p_kind, p_key);
end
$$;

-- Remove HTML tags and control characters (newlines kept), trim, cap length.
create or replace function private.clean(t text, max_len int)
returns text language sql immutable as $$
  select left(
    btrim(regexp_replace(regexp_replace(coalesce(t, ''), '<[^>]*>', '', 'g'), '[\x01-\x09\x0B\x0C\x0E-\x1F\x7F]', '', 'g')),
    max_len
  )
$$;

create or replace function private.check_client(p_client_id text)
returns void language plpgsql stable as $$
begin
  if p_client_id is null or p_client_id !~ '^[A-Za-z0-9_-]{8,64}$' then
    raise exception 'invalid_input';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Public API (called by the site through /rest/v1/rpc/...)
-- ---------------------------------------------------------------------------

create or replace function public.add_comment(p_post_id text, p_name text, p_body text, p_client_id text)
returns table (id uuid, post_id text, name text, body text, created_at timestamptz)
language plpgsql security definer set search_path = public, private, extensions as $$
#variable_conflict use_column
declare
  k text := private.request_key(p_client_id);
  v_name text := private.clean(p_name, 30);
  v_body text := private.clean(p_body, 400);
begin
  perform private.check_client(p_client_id);
  if p_post_id !~ '^[a-z0-9-]{1,80}$' or char_length(v_name) < 1 or char_length(v_body) < 2 then
    raise exception 'invalid_input';
  end if;
  perform private.enforce_rate('comment', k, 3, interval '1 minute');
  perform private.enforce_rate('comment-hour', k, 20, interval '1 hour');
  return query
    insert into public.comments as c (post_id, name, body, client_id, ip_hash)
    values (p_post_id, v_name, v_body, p_client_id, k)
    returning c.id, c.post_id, c.name, c.body, c.created_at;
end
$$;

create or replace function public.comment_counts()
returns table (post_id text, comments bigint)
language sql stable security definer set search_path = public as $$
  select c.post_id, count(*) from public.comments c group by c.post_id
$$;

create or replace function public.toggle_like(p_post_id text, p_client_id text)
returns table (liked boolean, likes bigint)
language plpgsql security definer set search_path = public, private, extensions as $$
#variable_conflict use_column
declare
  was boolean;
begin
  perform private.check_client(p_client_id);
  if p_post_id !~ '^[a-z0-9-]{1,80}$' then
    raise exception 'invalid_input';
  end if;
  perform private.enforce_rate('like', private.request_key(p_client_id), 30, interval '1 minute');
  delete from public.likes l where l.post_id = p_post_id and l.client_id = p_client_id returning true into was;
  if was is null then
    insert into public.likes (post_id, client_id) values (p_post_id, p_client_id);
  end if;
  return query select was is null, (select count(*) from public.likes l where l.post_id = p_post_id);
end
$$;

create or replace function public.like_counts()
returns table (post_id text, likes bigint)
language sql stable security definer set search_path = public as $$
  select l.post_id, count(*) from public.likes l group by l.post_id
$$;

create or replace function public.my_likes(p_client_id text)
returns setof text
language sql stable security definer set search_path = public as $$
  select l.post_id from public.likes l where l.client_id = p_client_id
$$;

create or replace function public.add_place(
  p_title text, p_location text, p_feeling text, p_description text, p_author text,
  p_colours text[], p_moods text[], p_image_path text, p_width int, p_height int, p_client_id text
)
returns table (
  id uuid, title text, location text, feeling text, description text, author text,
  colours text[], moods text[], image_path text, width int, height int, created_at timestamptz
)
language plpgsql security definer set search_path = public, private, extensions as $$
#variable_conflict use_column
declare
  k text := private.request_key(p_client_id);
  allowed_moods text[] := array['Energetic','Peaceful','Proud','Hopeful','Joyful','Calm','Nostalgic','Free','Amazed','Curious','Awe','Tranquil'];
  v_moods text[];
begin
  perform private.check_client(p_client_id);
  if not private.valid_hex_array(p_colours) or array_length(p_colours, 1) not between 3 and 5 then
    raise exception 'invalid_input';
  end if;
  if p_image_path is not null and p_image_path !~ '^[0-9a-f-]{36}\.jpg$' then
    raise exception 'invalid_input';
  end if;
  select coalesce(array_agg(m), '{}') into v_moods
    from (select distinct m from unnest(coalesce(p_moods, '{}')) as m where m = any (allowed_moods) limit 3) s;
  perform private.enforce_rate('place', k, 3, interval '1 hour');
  return query
    insert into public.places as p (title, location, feeling, description, author, colours, moods, image_path, width, height, client_id, ip_hash)
    values (
      nullif(private.clean(p_title, 60), ''),
      coalesce(nullif(private.clean(p_location, 60), ''), 'Kingdom of Bahrain'),
      nullif(private.clean(p_feeling, 300), ''),
      private.clean(p_description, 400),
      nullif(private.clean(p_author, 30), ''),
      (select array_agg(lower(c)) from unnest(p_colours) c),
      v_moods, p_image_path, p_width, p_height, p_client_id, k
    )
    returning p.id, p.title, p.location, p.feeling, p.description, p.author, p.colours, p.moods, p.image_path, p.width, p.height, p.created_at;
end
$$;

create or replace function public.add_taste(
  p_food text, p_tester text, p_mode text, p_look int, p_taste int,
  p_different text, p_reaction text, p_comment text, p_client_id text
)
returns table (
  id uuid, food text, tester text, mode text, look smallint, taste smallint,
  different text, reaction text, comment text, created_at timestamptz
)
language plpgsql security definer set search_path = public, private, extensions as $$
#variable_conflict use_column
declare
  k text := private.request_key(p_client_id);
begin
  perform private.check_client(p_client_id);
  perform private.enforce_rate('taste', k, 12, interval '10 minutes');
  return query
    insert into public.taste_results as t (food, tester, mode, look, taste, different, reaction, comment, client_id, ip_hash)
    values (
      p_food, nullif(private.clean(p_tester, 30), ''), p_mode,
      case when p_mode = 'blind' then null else p_look end,
      p_taste, p_different, private.clean(p_reaction, 8), private.clean(p_comment, 240), p_client_id, k
    )
    returning t.id, t.food, t.tester, t.mode, t.look, t.taste, t.different, t.reaction, t.comment, t.created_at;
end
$$;

-- Only visitors (anon) and signed-in users may call the public API.
revoke all on function public.add_place, public.add_taste from public;
revoke all on function public.add_comment, public.comment_counts, public.toggle_like, public.like_counts, public.my_likes from public;
grant execute on function public.add_comment, public.comment_counts, public.toggle_like, public.like_counts, public.my_likes,
  public.add_place, public.add_taste to anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Photo storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('places', 'places', true, 2097152, array['image/jpeg'])
on conflict (id) do update
  set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg'];

create or replace function private.recent_uploads()
returns bigint language sql stable security definer set search_path = storage as $$
  select count(*) from storage.objects where bucket_id = 'places' and created_at > now() - interval '1 minute'
$$;
grant usage on schema private to anon, authenticated;
grant execute on function private.recent_uploads() to anon, authenticated;

drop policy if exists "Visitors can upload place photos" on storage.objects;
create policy "Visitors can upload place photos" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'places'
    and name ~ '^[0-9a-f-]{36}\.jpg$'
    and private.recent_uploads() < 10
  );

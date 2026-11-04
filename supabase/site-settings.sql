create table if not exists public.storefront_settings (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.storefront_settings enable row level security;
revoke all on public.storefront_settings from anon, authenticated;
grant all on public.storefront_settings to service_role;

create table if not exists public.analytics_events (
  id text primary key,
  event_type text not null check (event_type in ('visitor', 'outbound_click')),
  session_id text not null,
  device text not null check (device in ('desktop', 'mobile', 'tablet')),
  page text,
  product_id text,
  product_title text,
  target_url text,
  browser text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);
create index if not exists analytics_events_product_clicks_idx
  on public.analytics_events (product_id, created_at desc)
  where event_type = 'outbound_click';
create unique index if not exists analytics_events_one_visit_per_session_idx
  on public.analytics_events (session_id)
  where event_type = 'visitor';

alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from anon, authenticated;
grant all on public.analytics_events to service_role;

create or replace function public.get_store_analytics(p_since timestamptz default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with filtered as (
    select *
    from public.analytics_events
    where p_since is null or created_at >= p_since
  ),
  daily as (
    select
      (created_at at time zone 'UTC')::date as event_date,
      count(*) filter (where event_type = 'visitor') as visitors,
      count(*) filter (where event_type = 'outbound_click') as clicks
    from filtered
    group by (created_at at time zone 'UTC')::date
  ),
  products as (
    select product_id, max(product_title) as product_title, count(*) as clicks
    from filtered
    where event_type = 'outbound_click'
    group by product_id
    order by clicks desc
  ),
  recent_clicks as (
    select *
    from filtered
    where event_type = 'outbound_click'
    order by created_at desc
    limit 20
  )
  select jsonb_build_object(
    'totalVisitors', (select count(*) from filtered where event_type = 'visitor'),
    'uniqueSessions', (select count(distinct session_id) from filtered where event_type = 'visitor'),
    'totalClicks', (select count(*) from filtered where event_type = 'outbound_click'),
    'clickRate', case
      when (select count(*) from filtered where event_type = 'visitor') = 0 then '0.0'
      else round(
        (select count(distinct session_id)::numeric from filtered where event_type = 'outbound_click') * 100
        / (select count(*) from filtered where event_type = 'visitor'),
        1
      )::text
    end,
    'timeSeries', coalesce((
      select jsonb_agg(jsonb_build_object(
        'date', event_date::text,
        'visitors', visitors,
        'clicks', clicks
      ) order by event_date)
      from daily
    ), '[]'::jsonb),
    'devices', jsonb_build_object(
      'desktop', (select count(*) from filtered where event_type = 'visitor' and device = 'desktop'),
      'mobile', (select count(*) from filtered where event_type = 'visitor' and device = 'mobile'),
      'tablet', (select count(*) from filtered where event_type = 'visitor' and device = 'tablet')
    ),
    'topClickedProducts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', product_id,
        'title', product_title,
        'clicks', clicks
      ) order by clicks desc)
      from products
    ), '[]'::jsonb),
    'recentClicks', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id,
        'productId', product_id,
        'productTitle', product_title,
        'timestamp', created_at,
        'date', (created_at at time zone 'UTC')::date::text,
        'month', to_char(created_at at time zone 'UTC', 'YYYY-MM'),
        'targetUrl', target_url,
        'device', device,
        'browser', browser
      ) order by created_at desc)
      from recent_clicks
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.get_store_analytics(timestamptz) from public, anon, authenticated;
grant execute on function public.get_store_analytics(timestamptz) to service_role;

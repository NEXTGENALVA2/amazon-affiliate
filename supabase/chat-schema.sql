create table if not exists public.chat_conversations (
  id text primary key,
  visitor_id text not null unique,
  customer_name text not null default 'Website Visitor',
  customer_handle text not null,
  product_id text,
  product_title text,
  last_message text not null default '',
  last_updated timestamptz not null default now(),
  unread_count integer not null default 0 check (unread_count >= 0),
  status text not null default 'open' check (status in ('open', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id text primary key,
  conversation_id text not null references public.chat_conversations(id) on delete cascade,
  sender text not null check (sender in ('customer', 'admin')),
  channel text not null default 'website' check (channel = 'website'),
  customer_name text not null,
  customer_handle text,
  text text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  timestamp timestamptz not null default now(),
  is_read boolean not null default false,
  product_id text,
  product_title text
);

create index if not exists chat_conversations_last_updated_idx
  on public.chat_conversations (last_updated desc);
create index if not exists chat_messages_conversation_timestamp_idx
  on public.chat_messages (conversation_id, timestamp);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
revoke all on public.chat_conversations from anon, authenticated;
revoke all on public.chat_messages from anon, authenticated;
grant all on public.chat_conversations to service_role;
grant all on public.chat_messages to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-attachments',
  'chat-attachments',
  false,
  12582912,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/webm',
    'audio/ogg',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/x-m4a'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = 12582912,
    allowed_mime_types = excluded.allowed_mime_types;

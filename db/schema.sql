-- Execute este script uma única vez no SQL Editor do Neon (painel do projeto)
-- para criar as tabelas usadas pelo login/cadastro e inscrição em eventos.

create extension if not exists pgcrypto;

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  email_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists login_tokens (
  token text primary key,
  member_id uuid not null references members(id) on delete cascade,
  event_slug text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_slug, member_id)
);

-- Textos do site editáveis pelo painel de administração (chave/valor simples).
create table if not exists site_content (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Contas de quem acessa o painel administrativo (/admin), com função e permissões.
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null,
  permissions text[] not null default '{}',
  status text not null default 'ativo',
  created_at timestamptz not null default now()
);

-- Marca quem já é membro validado pela diretoria (separado de eventos).
alter table members add column if not exists is_validated_member boolean not null default false;

-- Pedidos de cadastro de membro, aguardando validação da diretoria.
create table if not exists membership_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  phone text,
  cpf text,
  birthdate text,
  address text,
  time_at_church text,
  note text,
  status text not null default 'pendente',
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references admin_users(id)
);

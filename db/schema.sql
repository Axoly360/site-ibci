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
  next_path text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table login_tokens add column if not exists next_path text;

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

-- Senha da Central do Membro (login por e-mail+senha). Nulo para quem só
-- se cadastrou em um evento (login por link, sem senha).
alter table members add column if not exists password_hash text;

-- Marca lideranças (Pastores, Diáconos, Professores, Líderes) com acesso a
-- conteúdo restrito extra, como a escala mensal de serviços.
alter table members add column if not exists is_leadership boolean not null default false;
alter table members add column if not exists church_role text;

-- Perfil do membro, editável por ele mesmo depois de validado.
alter table members add column if not exists phone text;
alter table members add column if not exists cpf text;
alter table members add column if not exists birthdate text;
alter table members add column if not exists address text;
alter table members add column if not exists time_at_church text;
alter table members add column if not exists photo_url text;
alter table members add column if not exists baptism_date text;
alter table members add column if not exists arrival_date text;

-- Arquivos/documentos anexados a um membro pelo responsável no painel.
create table if not exists member_files (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  uploaded_by uuid references admin_users(id),
  uploaded_at timestamptz not null default now()
);

-- Banners/blocos de conteúdo editáveis pelo painel (imagem, título, link,
-- vídeo). Uma linha por "slot" do site (ex.: hero-2, banner-principal).
create table if not exists content_blocks (
  key text primary key,
  title text,
  subtitle text,
  image_url text,
  image_mobile_url text,
  video_url text,
  link_url text,
  updated_at timestamptz not null default now()
);

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

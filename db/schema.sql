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

-- Menu de navegação (categorias e subcategorias) editável pelo painel.
create table if not exists nav_items (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references nav_items(id) on delete cascade,
  label text not null,
  href text not null,
  value text,
  position integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

-- Semente única: recria a árvore de navegação atual do site. Rodar uma vez;
-- "on conflict do nothing" evita duplicar se rodar de novo por engano.
insert into nav_items (id, parent_id, label, href, position) values
  ('e0000000-0000-0000-0000-000000000000', null, 'Central do Membro', '/central-do-membro', 0),
  ('a0000000-0000-0000-0000-000000000000', null, 'A Igreja', '/a-igreja', 1),
  ('b0000000-0000-0000-0000-000000000000', null, 'Ministérios', '/ministerios', 2),
  ('c0000000-0000-0000-0000-000000000000', null, 'Para você', '/para-voce', 3),
  ('d0000000-0000-0000-0000-000000000000', null, 'Contato', '/contato', 4),

  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000000', 'Nossa História', '/a-igreja/nossa-historia', 0),
  ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000000', 'Em que Cremos', '/a-igreja/em-que-cremos', 1),
  ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000000', 'Liderança', '/a-igreja/lideranca', 2),
  ('a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000000', 'Missão, Valores e Visão', '/a-igreja/missao-valores-e-visao', 3),
  ('a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000000', 'Estatuto IBCI', '/a-igreja/estatuto-ibci', 4),
  ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000000', 'Nossa Congregação', '/a-igreja/nossa-congregacao', 5),
  ('a0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000000', 'Memorial IBCI', '/a-igreja/memorial-ibci', 6),

  ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000000', 'Pastoral', '/ministerios/pastoral', 0),
  ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000000', 'Diaconal', '/ministerios/diaconal', 1),
  ('b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000000', 'Louvor', '/ministerios/louvor', 2),
  ('b0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000000', 'Infantil', '/ministerios/infantil', 3),
  ('b0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000000', 'Jovens', '/ministerios/jovens', 4),
  ('b0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000000', 'Mulheres', '/ministerios/mulheres', 5),
  ('b0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000000', 'Homens', '/ministerios/homens', 6),
  ('b0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000000', 'Educação Cristã', '/ministerios/educacao-crista', 7),
  ('b0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000000', 'Ação Social', '/ministerios/acao-social', 8),
  ('b0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000000', 'Família', '/ministerios/familia', 9),

  ('c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000000', 'Dízimos e Ofertas', '/para-voce/dizimos-e-ofertas', 0),
  ('c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000000', 'Servir', '/para-voce/servir', 1),
  ('c0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000000', 'Eventos', '/para-voce/eventos', 2),
  ('c0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000000', 'Pedidos de Oração', '/para-voce/pedidos-de-oracao', 3),
  ('c0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000000', 'Mensagens', '/para-voce/mensagens', 4),
  ('c0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000000', 'Cursos', '/para-voce/cursos', 5),
  ('c0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000000', 'IBCI News', '/para-voce/ibci-news', 6),
  ('c0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000000', 'Projeto PEPE', '/para-voce/projeto-pepe', 7),
  ('c0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000000', 'Programações', '/para-voce/programacoes', 8),
  ('c0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000000', 'Fale Conosco', '/contato#formulario', 9),
  ('c0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000000', 'Privacidade', '/para-voce/privacidade', 10)
on conflict (id) do nothing;

insert into nav_items (id, parent_id, label, href, value, position) values
  ('d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000000', 'Telefone', '/contato#telefone', '(81) 3475-1778', 0),
  ('d0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000000', 'WhatsApp', '/contato#whatsapp', '(81) 98895-3552', 1),
  ('d0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000000', 'Email', '/contato#email', 'contato.ibci@gmail.com', 2),
  ('d0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000000', 'Horário de Atendimento', '/contato#horario', 'Segunda a Sexta das 8h às 17h', 3),
  ('d0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000000', 'Fale Conosco', '/contato#formulario', null, 4)
on conflict (id) do nothing;

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

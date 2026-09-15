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

-- Comprovantes de dízimos/ofertas enviados pelo próprio membro validado.
create table if not exists contribution_receipts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  note text,
  created_at timestamptz not null default now()
);

-- Classificação do comprovante (categoria, quem enviou, tipo e valor) e
-- fluxo de aprovação: o financeiro confere e aprova, o que gera
-- automaticamente o lançamento correspondente em financial_entries.
alter table contribution_receipts add column if not exists category text;
alter table contribution_receipts add column if not exists sender_type text;
alter table contribution_receipts add column if not exists type text;
alter table contribution_receipts add column if not exists amount numeric(12, 2);
alter table contribution_receipts add column if not exists status text not null default 'pendente';
alter table contribution_receipts add column if not exists approved_by uuid references admin_users(id);
alter table contribution_receipts add column if not exists approved_at timestamptz;

-- Solicitações de agendamento (casamentos, cultos de ação de graças etc.),
-- feitas por qualquer pessoa com conta, aguardando aprovação da diretoria.
create table if not exists booking_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  event_type text not null,
  desired_date text,
  message text,
  status text not null default 'pendente',
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references admin_users(id)
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

-- Lançamentos financeiros manuais (entrada/saída) feitos pelo tesoureiro no
-- painel. Não há gateway de pagamento nem webhook: todo lançamento é
-- registrado à mão, e o vínculo a um membro é opcional (só quando o
-- contribuinte foi identificado, ex.: dízimo em envelope ou informado
-- presencialmente).
--
-- NOTA (dívida técnica): este projeto ainda é single-tenant — não existe
-- tabela/coluna de igreja ("church_id") em nenhum lugar do schema. Se este
-- site vier a ser oferecido para outras igrejas, isso exige multi-tenantizar
-- o sistema inteiro (auth, todas as tabelas, todas as queries), não só o
-- financeiro. Por isso esta tabela também não tem church_id.
create table if not exists financial_entries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('entrada', 'saida')),
  category text not null,
  amount numeric(12, 2) not null check (amount > 0),
  -- Guardado como texto ISO (aaaa-mm-dd), como as demais datas do projeto
  -- (birthdate, baptism_date etc.), para evitar deslocamento de fuso horário
  -- na conversão. O formato ISO ainda ordena corretamente em comparações de
  -- texto (>=, <=) usadas nos filtros de período do relatório.
  entry_date text not null default to_char(current_date, 'YYYY-MM-DD'),
  description text,
  member_id uuid references members(id) on delete set null,
  created_by uuid references admin_users(id),
  created_at timestamptz not null default now()
);

-- Quem solicitou a saída (Pastor, Tesouraria, Secretaria, Zelador etc.) —
-- só faz sentido para lançamentos do tipo "saida"; para "entrada" o vínculo
-- de pessoa já é o member_id.
alter table financial_entries add column if not exists requested_by text;

-- Comprovante/nota anexado a um lançamento de saída (PDF, PNG ou JPEG),
-- guardado no Vercel Blob.
alter table financial_entries add column if not exists receipt_url text;

-- Vincula o comprovante ao lançamento gerado quando o financeiro aprova
-- (evita aprovar o mesmo comprovante duas vezes). Só pode vir depois de
-- financial_entries existir.
alter table contribution_receipts add column if not exists financial_entry_id uuid references financial_entries(id);

-- Auto-cadastro de visitante em evento (sem conta/login) + check-in por QR
-- Code no dia. Independente da tabela "registrations" (que exige conta de
-- membro via magic-link) — aqui qualquer visitante se cadastra pelo nome e
-- telefone e recebe um código curto (também digitável à mão na recepção).
create table if not exists event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  name text not null,
  phone text not null,
  email text,
  code text not null unique,
  checked_in_at timestamptz,
  checked_in_by uuid references admin_users(id),
  created_at timestamptz not null default now()
);

-- Cadastro espontâneo de visitante (QR fixo na entrada física ou de um
-- evento). Sem código, sem check-in, sem vínculo com event_attendees —
-- propósito diferente: é só contato para follow-up da recepção/ação social,
-- não controle de presença de um compromisso prévio.
create table if not exists visitor_registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sex text,
  first_visit boolean not null default true,
  visit_times integer,
  is_christian boolean not null default false,
  church_name text,
  location text,
  event_slug text,
  created_at timestamptz not null default now()
);

-- WhatsApp do visitante, para a recepção/ação social fazer follow-up direto.
alter table visitor_registrations add column if not exists whatsapp text;

-- Filiais/congregações da IBCI. Hoje só a Vila dos Milagres, mas já
-- preparado para outras filiais no futuro sem precisar remodelar nada.
create table if not exists congregations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  address text,
  created_at timestamptz not null default now()
);

insert into congregations (name, slug, address) values
  ('Vila dos Milagres', 'vila-dos-milagres', null)
on conflict (slug) do nothing;

-- Responsáveis com login próprio por congregação — permite mais de um por
-- filial (ex.: pastor local + tesoureiro local) sem compartilhar senha.
create table if not exists congregation_users (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references congregations(id) on delete cascade,
  name text not null,
  email text not null unique,
  password_hash text not null,
  status text not null default 'ativo',
  created_at timestamptz not null default now()
);

-- Solicitações da congregação para a central (verba, material, evento,
-- visita pastoral etc.), com aprovação da sede.
create table if not exists congregation_requests (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references congregations(id) on delete cascade,
  congregation_user_id uuid references congregation_users(id),
  category text not null,
  description text not null,
  estimated_amount numeric(12, 2),
  attachment_url text,
  status text not null default 'pendente',
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references admin_users(id),
  response_note text
);

-- Marca de qual congregação (ou null = sede) e de qual responsável veio um
-- lançamento já aprovado — assim entram no mesmo Relatório Financeiro da
-- sede, filtráveis por congregação, sem duplicar tela nem lógica.
alter table financial_entries add column if not exists congregation_id uuid references congregations(id);
alter table financial_entries add column if not exists congregation_user_id uuid references congregation_users(id);

-- Prestação de contas da congregação AGUARDANDO aprovação da central — não
-- vai direto pra financial_entries. O financeiro da sede revisa (mesma tela
-- de Lançamentos, pré-preenchida, igual ao fluxo de comprovante de membro) e
-- só ao confirmar cria a linha real em financial_entries.
create table if not exists congregation_financial_submissions (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references congregations(id) on delete cascade,
  congregation_user_id uuid references congregation_users(id),
  type text not null check (type in ('entrada', 'saida')),
  category text not null,
  amount numeric(12, 2) not null check (amount > 0),
  entry_date text not null default to_char(current_date, 'YYYY-MM-DD'),
  description text,
  receipt_url text,
  status text not null default 'pendente',
  financial_entry_id uuid references financial_entries(id),
  approved_by uuid references admin_users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- Orçamento anual que a central disponibiliza pra congregação. A congregação
-- vê quanto ainda resta (orçamento menos as saídas já aprovadas no ano) no
-- card de balanço da própria área.
alter table congregations add column if not exists annual_budget numeric(12, 2);

-- Eventos da igreja, geridos pelo admin (antes viviam num arquivo estático).
-- O slug continua sendo a chave usada por registrations, event_attendees e
-- visitor_registrations (texto solto, sem FK) — trocar o slug de um evento
-- que já tem inscritos quebra esse vínculo.
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  date_label text not null,
  location text not null,
  capacity integer,
  price text,
  image_url text,
  external_contact_label text,
  external_contact_whatsapp_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Campos adicionais de perfil (paridade com o cadastro de outras igrejas):
-- estado civil, naturalidade e profissão, editáveis pelo próprio membro.
alter table members add column if not exists marital_status text;
alter table members add column if not exists birthplace text;
alter table members add column if not exists profession text;

-- Filhos cadastrados pelo membro (responsável), usados pelo Ministério
-- Infantil para identificar a criança e montar a etiqueta de check-in.
create table if not exists member_children (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  name text not null,
  birthdate text,
  sex text,
  created_at timestamptz not null default now()
);

-- Aceite de termos de consentimento (LGPD) pelo membro — uso de imagem,
-- trabalho voluntário, proteção de crianças/adolescentes/idosos etc. Os
-- textos dos termos ficam em site_content (chave "consentimento.<termo>.*",
-- editável pelo painel); aqui só fica registrado quem aceitou e quando, para
-- fins de auditoria/compliance. term_key identifica qual termo foi aceito.
create table if not exists member_consents (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  term_key text not null,
  accepted_at timestamptz not null default now(),
  unique (member_id, term_key)
);

-- Semente única: preserva o evento que já existia no arquivo estático, com
-- o mesmo slug (para não quebrar inscrições/check-ins já feitos).
insert into events
  (slug, title, description, date_label, location, price, external_contact_label, external_contact_whatsapp_message)
values (
  'congresso-de-casais',
  'Congresso de Casais IBCI',
  'Está chegando o nosso Congresso de Casais, que acontecerá no Hotel Porto da Serra, em Gravatá, nos dias 12 e 13 de setembro. Teremos uma programação muito especial e emocionante, preparada com muito carinho para abençoar nossas famílias e fortalecer nossos casamentos. Serão mais de 40 casais desfrutando juntos desse momento tão especial. Além da presença dos nossos pastores e líderes, teremos conosco, no sábado pela manhã, ministrando a Palavra de Deus, o Pr. Gilberto Paz, da Igreja Batista Betânia, em Gravatá, e Presidente da OPBPE.',
  '12 e 13 de setembro — Hotel Porto da Serra, Gravatá',
  'Hotel Porto da Serra, Gravatá - PE',
  'R$ 350,00 por casal',
  'Falar com Maurício e Gineide',
  'Olá! Gostaria de me inscrever no Congresso de Casais IBCI, com Maurício e Gineide.'
)
on conflict (slug) do nothing;

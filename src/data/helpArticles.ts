import type { Permission } from "@/lib/admin-session";

export type HelpAudience = "admin" | "membro" | "congregacao";

export type HelpBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface HelpArticle {
  /** Único dentro da mesma audiência. */
  slug: string;
  title: string;
  audience: HelpAudience;
  /** Rótulo da categoria na barra lateral (ex.: "Mídias", "Grupos"). */
  category: string;
  /**
   * Só para audience "admin" — o admin só vê este artigo se tiver essa
   * permissão (mesma checagem hasPermission já usada pra esconder/mostrar
   * telas do painel). Artigos de membro/congregação não têm permissão
   * própria: qualquer sessão válida daquela área vê todos os artigos dela.
   */
  permission?: Permission;
  tags?: string[];
  blocks: HelpBlock[];
}

function p(text: string): HelpBlock {
  return { type: "p", text };
}
function ul(items: string[]): HelpBlock {
  return { type: "ul", items };
}

// ---------------------------------------------------------------------------
// Painel administrativo — Mídias
// ---------------------------------------------------------------------------

const midiasArticles: HelpArticle[] = [
  {
    slug: "admin-midias-banners",
    title: "Banners",
    audience: "admin",
    category: "Mídias",
    permission: "banners",
    tags: ["banner", "carrossel", "imagem", "hero", "destaque"],
    blocks: [
      p("Em Admin → Banners você controla as imagens que aparecem no topo da home (carrossel), os dois banners de destaque (Projeto PEPE e Congregação) e o banner principal, além do link do vídeo institucional."),
      p("Cada slot tem um tamanho ideal — enviar fora dessas medidas não quebra o site (a imagem é ajustada), mas pode cortar texto ou ficar com qualidade ruim."),
      {
        type: "table",
        headers: ["Slot", "Tamanho ideal", "Formato"],
        rows: [
          ["Carrossel do topo — desktop/tablet", "1360 × 460 px", "JPG, PNG ou WebP"],
          ["Carrossel do topo — mobile", "390 × 546 px", "JPG, PNG ou WebP"],
          ["Banner de destaque (par PEPE/Congregação)", "760 × 560 px", "JPG, PNG ou WebP"],
          ["Banner principal (largura total)", "1600 × 500 px", "JPG, PNG ou WebP"],
        ],
      },
      p("Todos os banners aceitam arquivos de até 10 MB. Se o upload falhar, o motivo mais comum é o arquivo passar desse limite ou estar em um formato diferente dos três aceitos."),
      p("O vídeo institucional (seção 'Conheça a IBCI') não é upload — você só cola o link do YouTube e o site mostra o player automaticamente."),
    ],
  },
  {
    slug: "admin-midias-secoes",
    title: "Seções da Home",
    audience: "admin",
    category: "Mídias",
    permission: "paginas",
    tags: ["seções", "home", "título", "subtítulo", "ordem"],
    blocks: [
      p("Em Admin → Seções você edita o título e o subtítulo de cada bloco de texto da home (Acesso Rápido, Últimas Mensagens, Eventos do Mês, Programação da Semana, Conheça a IBCI) e também pode mudar a ordem em que eles aparecem, usando as setas para cima/baixo."),
      p("Essa tela só muda os títulos das seções — o conteúdo de dentro de cada uma (os cards de Acesso Rápido, os vídeos, os eventos, a programação) é editado nas telas próprias (Acesso Rápido, Mensagens, Programação), listadas aqui do lado."),
    ],
  },
  {
    slug: "admin-midias-menu",
    title: "Menu",
    audience: "admin",
    category: "Mídias",
    permission: "paginas",
    tags: ["menu", "navegação", "categorias"],
    blocks: [
      p("Em Admin → Menu você edita as categorias e subcategorias do menu de navegação do site (ex.: 'A Igreja', 'Ministérios', 'Para você'), incluindo o texto do link e para onde ele aponta."),
      p("Também dá pra reordenar os itens e esconder temporariamente um item sem precisar excluí-lo."),
    ],
  },
  {
    slug: "admin-midias-programacao",
    title: "Programação da Semana",
    audience: "admin",
    category: "Mídias",
    permission: "paginas",
    tags: ["programação", "cultos", "agenda", "horários"],
    blocks: [
      p("Em Admin → Programação você cadastra os compromissos fixos da semana que aparecem na home (dia, título, horário e uma descrição curta) — culto de oração, EBD, encontros de ministérios, etc."),
      p("Um item novo entra no fim da lista; use Editar para corrigir algo ou Remover para tirar um compromisso que não acontece mais."),
    ],
  },
  {
    slug: "admin-midias-mensagens",
    title: "Mensagens (Últimas Mensagens)",
    audience: "admin",
    category: "Mídias",
    permission: "paginas",
    tags: ["mensagens", "vídeo", "youtube", "pregação"],
    blocks: [
      p("Em Admin → Mensagens você controla os vídeos do carrossel 'Últimas Mensagens' na home. Não é upload de vídeo: você cola o link completo do YouTube (qualquer formato — watch, youtu.be, live ou shorts) e escreve o título que vai aparecer no card."),
      p("Um vídeo novo sempre entra como o primeiro do carrossel (mais à esquerda). Se quiser reordenar manualmente, use as setas de mover que aparecem em cada vídeo da lista."),
    ],
  },
  {
    slug: "admin-midias-acesso-rapido",
    title: "Acesso Rápido",
    audience: "admin",
    category: "Mídias",
    permission: "paginas",
    tags: ["acesso rápido", "cards", "pix", "localização"],
    blocks: [
      p("Em Admin → Acesso Rápido você cria os cards da seção 'Acesso Rápido' da home (ex.: Horários dos Cultos, Localização, Pedido de Oração, Dízimos e Ofertas)."),
      p("Cada card tem um ícone (escolhido de uma lista fixa, pra manter a identidade visual do site), título, descrição e um tipo de ação:"),
      ul([
        "Link — abre um endereço (site, WhatsApp, mapa) numa aba nova ou na mesma aba.",
        "Chave PIX — abre o mesmo modal de contribuição com a chave PIX da igreja, sem precisar configurar nada além de marcar esse tipo.",
        "Só informativo — não tem ação, é só texto (ex.: horário dos cultos).",
      ]),
      p("Também dá pra reordenar os cards com as setas."),
    ],
  },
];

// ---------------------------------------------------------------------------
// Painel administrativo — Secretaria
// ---------------------------------------------------------------------------

const secretariaArticles: HelpArticle[] = [
  {
    slug: "admin-secretaria-membros",
    title: "Membros",
    audience: "admin",
    category: "Secretaria",
    permission: "membros",
    tags: ["membros", "cadastro", "aprovação", "liderança"],
    blocks: [
      p("Em Admin → Membros ficam os cadastros de membro aguardando validação da diretoria. Cada pedido mostra os dados enviados pela pessoa; você Aprova (ela vira membro validado e ganha acesso à Área do Membro completa) ou Recusa."),
      p("Membros já validados aparecem numa segunda lista, onde dá pra marcar alguém como liderança (o que libera a Escala de Serviços pra essa pessoa), anexar arquivos ao cadastro, revogar a validação ou excluir definitivamente o cadastro."),
      p("Excluir um cadastro apaga também tudo vinculado a ele (filhos, grupos, consentimentos, voluntariado). Lançamentos financeiros já registrados são mantidos, só perdem o vínculo com o nome."),
    ],
  },
  {
    slug: "admin-secretaria-grupos",
    title: "Grupos",
    audience: "admin",
    category: "Secretaria",
    permission: "membros",
    tags: ["grupos", "células", "solicitação"],
    blocks: [
      p("Em Admin → Grupos você cadastra os grupos/células da igreja (nome, líder, dia de reunião, local) e gerencia quem participa de cada um."),
      p("Um membro pode solicitar entrada em um grupo pela Central do Membro; a solicitação aparece na tela do grupo (Ver membros), onde você Aprova (ele já entra automaticamente) ou Recusa. Você também pode adicionar um membro direto, sem precisar de solicitação."),
    ],
  },
  {
    slug: "admin-secretaria-servir",
    title: "Servir",
    audience: "admin",
    category: "Secretaria",
    permission: "membros",
    tags: ["servir", "voluntariado", "ministérios"],
    blocks: [
      p("Em Admin → Servir você acompanha quem se cadastrou como voluntário e em quais ministérios, com filtro por ministério."),
      p("O membro só consegue se cadastrar depois de aceitar os termos de Consentimento (uso de imagem, trabalho voluntário e proteção de crianças/idosos) — não existe uma etapa de aprovação aqui, é só um acompanhamento de quem se disponibilizou."),
    ],
  },
  {
    slug: "admin-secretaria-visitantes",
    title: "Visitantes",
    audience: "admin",
    category: "Secretaria",
    permission: "visitantes",
    tags: ["visitantes", "recepção", "follow-up"],
    blocks: [
      p("Em Admin → Visitantes ficam os cadastros espontâneos feitos pela recepção ou por QR Code (nome, contato, se é a primeira visita, se já é cristão) — servem para o time de acolhimento fazer o follow-up, sem vínculo com login de membro."),
    ],
  },
  {
    slug: "admin-secretaria-eventos",
    title: "Eventos",
    audience: "admin",
    category: "Secretaria",
    permission: "eventos",
    tags: ["eventos", "inscrição", "check-in", "qr code"],
    blocks: [
      p("Em Admin → Eventos você cria, edita e remove os eventos que aparecem em 'Eventos do Mês' na home e em Para Você → Eventos."),
      p("Cada evento tem título, descrição, data (texto livre), local, capacidade e preço opcionais, e uma imagem opcional de aproximadamente 800 × 450 px (proporção 16:9), em PNG ou JPEG."),
      p("Se marcar 'inscrição combinada por fora do site', o evento mostra um botão que abre o WhatsApp de um responsável, em vez do formulário de inscrição pelo site."),
      p("Cada evento tem uma tela própria de Check-in (por QR Code) — cuidado ao mudar o slug de um evento que já tem gente inscrita: isso quebra o vínculo com as inscrições existentes."),
    ],
  },
  {
    slug: "admin-secretaria-consentimento",
    title: "Consentimento",
    audience: "admin",
    category: "Secretaria",
    permission: "documentos",
    tags: ["consentimento", "lgpd", "termos", "imagem"],
    blocks: [
      p("Em Admin → Consentimento você escreve o texto oficial dos termos que o membro lê e aceita na Central do Membro: uso de imagem, trabalho voluntário e proteção de crianças/adolescentes/idosos."),
      p("O texto começa em branco de propósito — ele só aparece pro membro assinar depois que alguém aqui colar a versão revisada pela diretoria/assessoria jurídica."),
      p("O aceite (ou a revogação) de cada membro fica registrado com data, e alguns fluxos — como o cadastro de voluntariado em Servir — exigem que os 3 termos estejam aceitos antes de liberar o formulário."),
    ],
  },
  {
    slug: "admin-secretaria-documentos",
    title: "Documentos (Estatuto e Regimento)",
    audience: "admin",
    category: "Secretaria",
    permission: "documentos",
    tags: ["documentos", "estatuto", "regimento", "pdf"],
    blocks: [
      p("Em Admin → Documentos você faz upload do Estatuto e do Regimento Interno da igreja, sempre em PDF. O arquivo enviado substitui o anterior."),
      p("Esses documentos ficam visíveis publicamente em A Igreja → Estatuto IBCI, em abas separadas, com um visualizador embutido e um botão de download."),
    ],
  },
];

// ---------------------------------------------------------------------------
// Painel administrativo — Financeiro
// ---------------------------------------------------------------------------

const financeiroArticles: HelpArticle[] = [
  {
    slug: "admin-financeiro-comprovantes",
    title: "Comprovantes",
    audience: "admin",
    category: "Financeiro",
    permission: "financeiro",
    tags: ["comprovantes", "dízimo", "oferta"],
    blocks: [
      p("Em Admin → Financeiro ficam os comprovantes de dízimo/oferta que os próprios membros enviam pela Central do Membro, em PDF, PNG ou JPEG."),
      p("Marcando a caixinha de um comprovante, você é levado direto pra tela de Lançamentos com os dados (membro, tipo, valor) já preenchidos — só confere e confirma. Isso evita lançar o mesmo comprovante duas vezes."),
    ],
  },
  {
    slug: "admin-financeiro-lancamentos",
    title: "Lançamentos",
    audience: "admin",
    category: "Financeiro",
    permission: "financeiro",
    tags: ["lançamentos", "entrada", "saída"],
    blocks: [
      p("Em Admin → Financeiro → Lançamentos você registra manualmente cada entrada ou saída (categoria, valor, data, descrição, e — só para saída — quem solicitou e um comprovante/nota anexado)."),
      p("Lançamentos que vieram de um comprovante de membro ou de uma prestação de contas de congregação chegam aqui já pré-preenchidos; lançamentos avulsos (dízimo em envelope, despesa da tesouraria) você digita direto."),
    ],
  },
  {
    slug: "admin-financeiro-relatorio",
    title: "Relatório",
    audience: "admin",
    category: "Financeiro",
    permission: "financeiro",
    tags: ["relatório", "csv", "exportar"],
    blocks: [
      p("Em Admin → Financeiro → Relatório você filtra os lançamentos por período, tipo e congregação (sede ou uma filial específica), e pode exportar o resultado em CSV pra usar numa planilha."),
    ],
  },
];

// ---------------------------------------------------------------------------
// Painel administrativo — Congregações
// ---------------------------------------------------------------------------

const congregacoesAdminArticles: HelpArticle[] = [
  {
    slug: "admin-congregacoes-cadastro",
    title: "Cadastro de Congregações",
    audience: "admin",
    category: "Congregações",
    permission: "congregacoes",
    tags: ["congregações", "filiais", "orçamento", "responsáveis"],
    blocks: [
      p("Em Admin → Congregações fica a supervisão das filiais da IBCI (hoje, a Vila dos Milagres). Aqui a sede vê, para cada congregação, quantas solicitações e prestações de contas estão pendentes."),
      p("Dentro de cada congregação você gerencia os responsáveis com login próprio (nome, e-mail, senha, status ativo/inativo), decide as solicitações (verba, material, evento, visita pastoral) enviadas pela congregação, revisa a prestação de contas financeira antes de virar lançamento oficial, e define o orçamento anual disponível para aquela congregação."),
      p("A prestação de contas da congregação passa pelo mesmo fluxo de aprovação dos comprovantes de membro: você confere os dados pré-preenchidos na tela de Lançamentos e confirma."),
    ],
  },
];

// ---------------------------------------------------------------------------
// Painel administrativo — Administração
// ---------------------------------------------------------------------------

const administracaoArticles: HelpArticle[] = [
  {
    slug: "admin-administracao-usuarios",
    title: "Administradores e Permissões",
    audience: "admin",
    category: "Administração",
    permission: "admins",
    tags: ["administradores", "permissões", "acessos", "papéis"],
    blocks: [
      p("Em Admin → Administradores você cria e edita as contas com acesso ao painel, cada uma com um papel (Administrador geral, Mídias, Secretária, Financeiro ou Congregação) que já define automaticamente quais telas essa pessoa vai enxergar."),
      p("Importante: as permissões de cada conta ficam gravadas no momento em que ela é criada ou editada. Se uma permissão nova for adicionada a um papel depois, quem já tinha aquele papel não ganha o acesso novo sozinho — é preciso reabrir a conta da pessoa, salvar de novo (mesmo sem mudar nada) e pedir pra ela sair e entrar de novo."),
      p("Só quem tem o papel Administrador geral enxerga esta tela."),
    ],
  },
];

// ---------------------------------------------------------------------------
// Central do Membro
// ---------------------------------------------------------------------------

const membroArticles: HelpArticle[] = [
  {
    slug: "membro-cadastro",
    title: "Cadastro e Aprovação",
    audience: "membro",
    category: "Cadastro",
    tags: ["cadastro", "aprovação", "visitante", "seja membro"],
    blocks: [
      p("Qualquer pessoa pode criar uma conta em Central do Membro → Faça seu cadastro, com nome, e-mail e senha. Enquanto a diretoria não aprova, você tem acesso a uma área de visitante — com card de perfil, grupos e algumas funções liberadas — mas não à Área do Membro completa."),
      p("Se você já tem conta e só ainda não pediu pra virar membro oficial, use a opção 'Seja um Membro' no seu painel: é um formulário mais curto (nome, telefone, CPF e aceite de uso dos dados), sem precisar criar senha de novo."),
      p("Depois que a diretoria aprova, o mesmo login (mesmo e-mail e senha) passa a abrir automaticamente a Área do Membro completa, com financeiro, escala, grupos e tudo mais."),
    ],
  },
  {
    slug: "membro-grupos",
    title: "Grupos",
    audience: "membro",
    category: "Grupos",
    tags: ["grupos", "células", "solicitar"],
    blocks: [
      p("Em Grupos você vê os grupos/células cadastrados pela igreja, com líder, dia e local de reunião, e pode clicar em 'Solicitar entrada' no que tiver interesse."),
      p("A solicitação fica pendente até alguém da secretaria aprovar. Depois de aprovada, o grupo aparece no card 'Meus Grupos' do seu painel, com todos os detalhes."),
    ],
  },
  {
    slug: "membro-contribuicoes",
    title: "Contribuições",
    audience: "membro",
    category: "Financeiro",
    tags: ["contribuições", "dízimo", "oferta", "comprovante", "pix"],
    blocks: [
      p("Em Dízimos e Ofertas você encontra a chave PIX da igreja pra contribuir. Depois de fazer o PIX, envie o comprovante em Contribuições e Saídas — aceita PDF, PNG ou JPEG."),
      p("O comprovante enviado fica com status 'pendente' até o financeiro conferir e lançar oficialmente; depois disso ele aparece no seu histórico junto com o resumo do ano."),
    ],
  },
  {
    slug: "membro-servir",
    title: "Servir",
    audience: "membro",
    category: "Servir",
    tags: ["servir", "voluntariado", "ministério"],
    blocks: [
      p("Em Servir você indica em qual organização quer servir (a sede ou uma congregação) e em quais ministérios já serve ou gostaria de servir, com um campo livre pra contar mais detalhes."),
      p("Antes de liberar esse formulário, o site pede que você aceite os 3 termos de Consentimento (uso de imagem, trabalho voluntário e proteção de crianças/idosos) — se algum ainda não foi aceito, um link leva direto pra tela de Consentimento."),
    ],
  },
  {
    slug: "membro-filhos",
    title: "Ministério Infantil (Filhos)",
    audience: "membro",
    category: "Filhos",
    tags: ["filhos", "crianças", "ministério infantil"],
    blocks: [
      p("Em Ministério Infantil você cadastra seus filhos (nome, data de nascimento, sexo) para facilitar a entrada deles nas atividades infantis durante os cultos."),
      p("Dá pra editar ou remover um cadastro a qualquer momento."),
    ],
  },
  {
    slug: "membro-eventos",
    title: "Eventos",
    audience: "membro",
    category: "Eventos",
    tags: ["eventos", "inscrição", "agendamento"],
    blocks: [
      p("Em Eventos você vê os eventos programados pela igreja e se inscreve diretamente pelo site, quando a inscrição é feita por aqui — alguns eventos pedem que você fale com um responsável pelo WhatsApp em vez disso."),
      p("Em Eventos (no seu painel) você também pode solicitar agendamento de casamento, culto de ação de graças e outras celebrações especiais."),
    ],
  },
  {
    slug: "membro-perfil",
    title: "Editar Perfil e Foto",
    audience: "membro",
    category: "Perfil",
    tags: ["perfil", "foto", "dados pessoais", "cadastro"],
    blocks: [
      p("Em Meu Cadastro você mantém seus dados atualizados: telefone, CPF, endereço, data de nascimento, batismo, chegada na igreja, estado civil, naturalidade e profissão."),
      p("A foto de perfil deve ser quadrada, com no mínimo 400 × 400 px, em qualquer formato de imagem comum, até 5 MB."),
    ],
  },
];

// ---------------------------------------------------------------------------
// Portal da Congregação
// ---------------------------------------------------------------------------

const congregacaoArticles: HelpArticle[] = [
  {
    slug: "congregacao-login",
    title: "Login",
    audience: "congregacao",
    category: "Acesso",
    tags: ["login", "senha", "acesso"],
    blocks: [
      p("O acesso do responsável pela congregação é separado do login de membro comum: use o e-mail e a senha cadastrados pela sede especificamente para você, na tela de entrada da sua congregação."),
      p("Se você esqueceu a senha ou ainda não tem uma conta, fale com a sede — só a diretoria pode criar ou redefinir o acesso de um responsável de congregação."),
    ],
  },
  {
    slug: "congregacao-financeiro",
    title: "Lançamento Financeiro",
    audience: "congregacao",
    category: "Financeiro",
    tags: ["financeiro", "entrada", "saída", "comprovante", "orçamento"],
    blocks: [
      p("Em Financeiro você registra as entradas e saídas da congregação: tipo (entrada ou saída), categoria, valor, data, descrição e um comprovante opcional (PDF, PNG ou JPEG)."),
      p("O lançamento não entra direto no financeiro oficial — ele fica com status 'pendente' até o financeiro da sede conferir e confirmar, exatamente como acontece com os comprovantes enviados por um membro."),
      p("Nessa mesma tela você acompanha o balanço do ano (entradas, saídas, saldo) e quanto ainda resta do orçamento anual que a sede disponibilizou pra sua congregação."),
    ],
  },
  {
    slug: "congregacao-solicitacoes",
    title: "Solicitações",
    audience: "congregacao",
    category: "Solicitações",
    tags: ["solicitações", "verba", "material", "visita pastoral"],
    blocks: [
      p("Em Solicitações você pede à sede verba, material, autorização de evento ou visita pastoral, escolhendo uma categoria e escrevendo uma descrição — além de um valor estimado, se fizer sentido para o pedido."),
      p("Essa tela não tem envio de arquivo/anexo: é só categoria, descrição e valor estimado. A sede analisa e responde com aprovação, recusa, e pode deixar uma observação sobre a decisão."),
    ],
  },
  {
    slug: "congregacao-orcamento",
    title: "Orçamento Anual",
    audience: "congregacao",
    category: "Orçamento",
    tags: ["orçamento", "saldo", "verba anual"],
    blocks: [
      p("A sede define um orçamento anual disponível para a sua congregação. Esse valor, junto com o total de saídas já aprovadas no ano, aparece no card de balanço da tela de Financeiro, mostrando quanto ainda resta pra usar."),
      p("Só entram nesse cálculo os lançamentos já aprovados pela sede — prestações de contas ainda pendentes não são descontadas do orçamento disponível."),
    ],
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  ...midiasArticles,
  ...secretariaArticles,
  ...financeiroArticles,
  ...congregacoesAdminArticles,
  ...administracaoArticles,
  ...membroArticles,
  ...congregacaoArticles,
];

export function getHelpArticles(audience: HelpAudience): HelpArticle[] {
  return HELP_ARTICLES.filter((article) => article.audience === audience);
}

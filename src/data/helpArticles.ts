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
    slug: "admin-secretaria-ebd",
    title: "EBD (Escola Bíblica Dominical)",
    audience: "admin",
    category: "Secretaria",
    permission: "membros",
    tags: ["ebd", "escola bíblica", "salas", "classes", "alunos", "professores"],
    blocks: [
      p("Em Admin → EBD você cadastra as salas da Escola Bíblica Dominical: nome, professor(a), público (Crianças, Jovens, Adultos…), horário, local e descrição ou tema do trimestre."),
      p("Os próprios membros escolhem a sala que frequentam na Área do Membro (card Ensino ou Minha EBD). O pedido chega em Ver alunos, em Solicitações pendentes, e a Secretaria ou o Administrador geral só precisa Aprovar ou Recusar. O número de pendentes aparece na lista de salas, no Painel e nas Estatísticas."),
      p("Também dá para matricular direto, em Adicionar aluno: um membro validado ou uma criança (filho cadastrado por um responsável em Grupo Familiar). Os responsáveis também podem pedir a sala dos familiares em Grupo Familiar; esses pedidos chegam em Solicitações pendentes, como os dos membros. Cada pessoa aparece uma vez por sala, e pode estar em mais de uma."),
      p("Remover uma sala desvincula os alunos dela, sem apagar os cadastros. O total de alunos por sala aparece nas Estatísticas."),
    ],
  },
  {
    slug: "admin-secretaria-presenca",
    title: "Presença nos cultos",
    audience: "admin",
    category: "Secretaria",
    permission: "membros",
    tags: ["presença", "cultos", "frequência", "média", "visitantes", "contagem"],
    blocks: [
      p("Em Admin → Presença você lança quantas pessoas estiveram em cada culto: data, qual culto (escolha uma sugestão ou digite), o total de presentes e, se quiser, quantos eram visitantes. O total já inclui os visitantes."),
      ul([
        "Lançar de novo o mesmo culto na mesma data atualiza o número (ou use Editar na lista). A lista mostra os 60 lançamentos mais recentes e a média dos últimos 8.",
        "Não dá para lançar data futura.",
        "A média de presença por culto, mês a mês e por tipo de culto, aparece em Estatísticas (e no PDF delas). É uma contagem de pessoas, não uma lista de nomes.",
        "A presença da EBD é separada: vem da chamada que cada professor faz na Área do Professor.",
      ]),
    ],
  },
  {
    slug: "admin-secretaria-diretorias",
    title: "Diretorias (Presidente e Vice-presidente)",
    audience: "admin",
    category: "Secretaria",
    permission: "membros",
    tags: ["diretoria", "presidente", "vice-presidente", "shb", "mm", "ubaci", "unijovem", "mandato", "insígnia"],
    blocks: [
      p("Em Admin → Diretorias você lança quem preside cada organização da igreja (SHB, MM, UBACI, Unijovem e as que você acrescentar). Escolha o membro validado, a organização, o cargo (Presidente ou Vice-presidente) e a data de início; a data de fim é opcional."),
      p("Enquanto hoje estiver dentro do mandato, o membro ganha uma insígnia no perfil, por exemplo \"Presidente · SHB\", e a etiqueta genérica \"Líder\" deixa de aparecer. Quando o mandato termina, a insígnia some sozinha e o cargo vai para o Histórico."),
      ul([
        "Datas: use o botão Datas ao lado do cargo para ajustar o início ou registrar o fim do mandato.",
        "Organizações: no fim da página você edita nome e sigla, adiciona novas e remove. Remover uma organização apaga também os cargos lançados nela.",
        "Quem tem cargo em exercício ganha, no perfil, o botão Área da Diretoria: lá a diretoria aprova os pedidos para participar, adiciona e remove integrantes e mantém a agenda da organização. O total de integrantes por organização aparece em Estatísticas.",
        "Fora isso, a diretoria não libera nenhum acesso extra (a Escala de Serviços continua dependendo da marcação de liderança em Membros).",
        "Ordem das insígnias no perfil: Pastor, Presidente, Vice-presidente, Diácono, Professor. Passando de 4, o resto vira +N.",
      ]),
    ],
  },
  {
    slug: "admin-secretaria-professores",
    title: "Professores da EBD",
    audience: "admin",
    category: "Secretaria",
    permission: "membros",
    tags: ["professores", "ebd", "aprovação", "salas", "chamada"],
    blocks: [
      p("O membro marca \"Sou professor(a) da EBD\" em Meu Cadastro e o pedido chega em Admin → Professores. Você confere e Aprova ou Recusa. Depois de aprovado, o membro ganha uma insígnia no perfil e o botão Área do Professor."),
      p("Para o professor ver a sala, atribua-o em Admin → EBD (Nova sala ou Editar): cada sala aceita até 3 professores, escolhidos entre os aprovados, mais professores sem cadastro, digitados pelo nome. Afastar tira o acesso à Área do Professor sem apagar o cadastro."),
      ul([
        "Na Área do Professor, ele vê as salas dele, os alunos e lança a chamada de cada domingo.",
        "Ele também pode adicionar alunos sem cadastro no site: entram direto na sala, sem precisar de aprovação (aparecem em Admin → EBD → Ver alunos como sem cadastro).",
        "A presença média por sala e por domingo aparece em Estatísticas.",
      ]),
    ],
  },
  {
    slug: "admin-secretaria-diaconos",
    title: "Diáconos",
    audience: "admin",
    category: "Secretaria",
    permission: "diaconos",
    tags: ["diáconos", "diaconisas", "ministério diaconal", "escala"],
    blocks: [
      p("Em Admin → Diáconos fica o ministério diaconal da igreja, em três abas: Solicitações, Diáconos e Escala."),
      p("Solicitações: quando o membro marca \"Sou diácono\" ou \"Sou diaconisa\" em Meu Cadastro, o pedido chega aqui como Solicitado. Em Analisar você confere, preenche os dados (consagração, área de atuação, congregação) e Confirma; ou Recusa. Enquanto não for confirmado, a pessoa não conta como diácono."),
      ul([
        "Diáconos: lista dos confirmados, com situação (Ativo, Afastado ou Emérito), área de atuação, congregação e data de consagração. Use Editar para atualizar.",
        "Escala: escale diáconos ativos por data e culto, com o posto de cada um (ex.: Recepção). A lista mostra só as datas de hoje em diante.",
      ]),
      p("Diretoria diaconal: ao editar um diácono ativo, marque a caixa \"Diretoria diaconal\". Quem está marcado ganha, na Área dos Diáconos, o botão Gerenciar escala e atividades, para montar a escala do mês e ajustar as listas de atividades (cultos, visitas, reunião mensal) e de tarefas (Pátio, Recepção, Direção de culto, Pregação) sem depender do painel admin."),
      p("Este acesso é da Secretaria e do Administrador geral. Se uma conta já existia, edite e salve o administrador em Administradores para ela receber a nova permissão."),
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
      p("Aprovar com um clique: o botão Aprovar, na primeira coluna da linha do comprovante, cria o lançamento direto com os dados enviados (membro, categoria, tipo e valor), usando como data o dia do envio, e marca o comprovante como lançado. Vale também para as prestações de contas das congregações, em Admin → Congregações → Financeiro, onde a data é a informada pela congregação."),
      p("Para conferir ou corrigir antes de lançar, marque Revisar antes, logo abaixo do botão: você é levado para a tela de Lançamentos com os dados já preenchidos, ajusta o que precisar e confirma. Nos dois caminhos o sistema impede lançar o mesmo comprovante duas vezes."),
      p("Se aprovar por engano, o lançamento pode ser editado ou removido em Lançamentos. O botão fica desabilitado quando o comprovante não tem categoria, tipo ou valor; nesse caso use Revisar antes."),
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
  {
    slug: "admin-administracao-estatisticas",
    title: "Estatísticas da Igreja",
    audience: "admin",
    category: "Administração",
    permission: "admins",
    tags: ["estatísticas", "painel", "dashboard", "números", "gráficos"],
    blocks: [
      p("Em Admin → Estatísticas o Administrador geral vê a igreja em números, num só lugar: membros ativos, idade média e faixa etária, sexo, estado civil, batismos por ano, crianças e média por família, grupos, voluntários por ministério, diáconos, visitantes, eventos e, para quem tem acesso ao Financeiro, entradas, saídas e saldo."),
      p("Os botões 3, 6 e 12 meses mudam o período dos gráficos mensais. Só aparecem números agregados, nunca listas de pessoas."),
      p("Congregação: use os botões Igreja toda, Sede ou o nome de uma congregação. O filtro vale para o que o sistema separa por congregação (Financeiro, Voluntários por ministério e Diáconos); as outras seções continuam mostrando a igreja toda, e a página avisa isso."),
      p("Exportar PDF: o botão abre a impressão do navegador com uma versão limpa do relatório (sem menu, com título, período, congregação e data de geração). Em \"Destino\", escolha \"Salvar como PDF\" e salve. O PDF reflete o período e a congregação que estiverem selecionados."),
      ul([
        "Sexo: só conta quem preencheu o campo em Meu Cadastro; os demais aparecem como \"Não informado\".",
        "Idade: usa a data de nascimento do cadastro; o card mostra quantos membros têm a data informada.",
        "Se uma seção não carregar, o painel avisa no topo em vez de mostrar zero.",
        "Alunos por sala da EBD vêm de Admin → EBD. Presença nos cultos ainda não é registrada, então não aparece.",
      ]),
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
    title: "Grupo Familiar",
    audience: "membro",
    category: "Grupo Familiar",
    tags: ["familia", "filhos", "crianças", "cônjuge", "ministério infantil"],
    blocks: [
      p("Em Grupo Familiar você cadastra os familiares que também congregam na IBCI — cônjuge, filhos e outros — informando nome, parentesco, data de nascimento e sexo."),
      p("Cadastrar os filhos aqui facilita a entrada deles nas atividades do Ministério Infantil durante os cultos, e ajuda a diretoria a te conhecer melhor."),
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
      p("Em Meu Cadastro você mantém seus dados atualizados: telefone, CPF, endereço, data de nascimento, sexo, batismo, chegada na igreja, estado civil, naturalidade e profissão."),
      p("A foto de perfil deve ser quadrada, com no mínimo 400 × 400 px, em qualquer formato de imagem comum, até 5 MB."),
    ],
  },
  {
    slug: "membro-ebd",
    title: "Minha Sala da EBD",
    audience: "membro",
    category: "Grupos",
    tags: ["ebd", "escola bíblica", "sala", "classe", "ensino"],
    blocks: [
      p("Na Área do Membro, toque em Ensino (ou no card Minha EBD) para ver as salas da Escola Bíblica Dominical, com professor, horário e local."),
      p("Na sala que você frequenta, toque em \"Esta é a minha sala\". A secretaria confirma o seu pedido, e depois disso a sala aparece em Minha EBD. Se o pedido não for aprovado, você pode pedir de novo."),
      p("Só membros com cadastro validado podem escolher a sala."),
      p("Filhos e outros familiares: em Grupo Familiar, no cartão de cada familiar, escolha a sala em \"Escolher sala da EBD\" e toque em Pedir sala. O pedido também fica aguardando a aprovação da secretaria, e depois aparece \"EBD: nome da sala\" no cartão do familiar."),
    ],
  },
  {
    slug: "membro-organizacoes",
    title: "Organizações (SHB, MM, UBACI, Unijovem)",
    audience: "membro",
    category: "Grupos",
    tags: ["organizações", "shb", "mm", "ubaci", "unijovem", "agenda", "diretoria", "participar"],
    blocks: [
      p("Na Área do Membro, em Mais → Organizações, você vê as organizações da igreja. Toque em \"Quero participar\" na que for a sua: a diretoria dela recebe o pedido e aprova."),
      p("Depois de aprovado, você passa a ver a agenda da organização (próximos compromissos, com data, horário e local) e pode sair quando quiser. A agenda é visível só para os integrantes e para a diretoria."),
      p("Se você é presidente ou vice-presidente (mandato em exercício, lançado pela Secretaria), aparece o botão Área da Diretoria no seu perfil. Lá você aprova pedidos, adiciona e remove integrantes e cria ou remove compromissos da agenda."),
    ],
  },
  {
    slug: "membro-professor",
    title: "Sou Professor(a) da EBD",
    audience: "membro",
    category: "Perfil",
    tags: ["professor", "ebd", "chamada", "alunos", "sala"],
    blocks: [
      p("Em Meu Cadastro, no campo Ensino na EBD, escolha \"Sou professor(a) da EBD\" e salve. A Secretaria confere e confirma; até lá, você continua como membro."),
      p("Depois de confirmado, aparece uma insígnia ao lado do seu nome na Área do Membro e o botão Área do Professor. A Secretaria atribui a você a sala (cada sala tem até 3 professores)."),
      ul([
        "Minhas salas: horário, local, professores da sala, número de alunos e a presença média.",
        "Chamada: escolha a data (o padrão é o último domingo), marque quem esteve presente e salve. Dá para corrigir a mesma data depois.",
        "Alunos sem cadastro: adicione pelo nome (telefone é opcional). Eles entram direto na sua sala, sem aprovação, e você pode removê-los. Alunos com cadastro entram pedindo a sala em Ensino, e a Secretaria aprova.",
      ]),
    ],
  },
  {
    slug: "membro-diaconos",
    title: "Sou Diácono ou Diaconisa",
    audience: "membro",
    category: "Perfil",
    tags: ["diácono", "diaconisa", "ministério diaconal", "escala"],
    blocks: [
      p("Em Meu Cadastro, no campo Ministério diaconal, escolha \"Sou diácono\" ou \"Sou diaconisa\" e salve. A Secretaria confere e confirma a sua informação; até lá, você continua como membro."),
      p("Depois de confirmado, aparece uma etiqueta ao lado do seu nome na Área do Membro e o botão Área dos Diáconos, com seus dados no ministério, a sua escala, a escala dos próximos cultos e o corpo de diáconos."),
      p("Se você faz parte da diretoria diaconal (marcado pela Secretaria), a Área dos Diáconos também mostra o botão Gerenciar escala e atividades: escolha o mês, escale diáconos por data, atividade e tarefa, e adicione ou remova atividades e tarefas das listas."),
      p("Para corrigir os dados do ministério (consagração, área de atuação, congregação), fale com a Secretaria."),
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

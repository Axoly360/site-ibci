# Estudo do Diaconato — Plataforma de preparação para o concílio

Site estático (Vite + React + TypeScript + Tailwind) para estudar antes do concílio
de exame do Curso de Capacitação para o Ministério Diaconal. Sem backend, sem banco
de dados, sem login — tudo roda no navegador, e o progresso fica salvo no aparelho
(`localStorage`).

## Rodando localmente

Pré-requisito: [Node.js](https://nodejs.org) 18 ou mais recente.

```bash
cd diaconos-estudo
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

Outros comandos úteis:

```bash
npm run validar   # valida src/data/conteudo.json (schema Zod + regras de negócio)
npm test          # roda os testes automatizados (Vitest)
npm run build     # gera a versão de produção em dist/
```

## Estrutura

```
diaconos-estudo/
├── material/              # PDF da apostila e foto do resumo — NUNCA vai para o Git nem para o deploy
├── scripts/
│   └── validar-conteudo.ts
├── src/
│   ├── data/
│   │   ├── conteudo.json   # todo o conteúdo de estudo (perguntas, listas, versículos, quiz)
│   │   └── schema.ts       # schema Zod + regras de negócio
│   ├── lib/                 # funções puras (Leitner, sorteio, tempo de fala, etc.) — com testes
│   ├── components/
│   └── pages/               # um arquivo por modo de estudo
├── REVISAR.md               # itens para confirmar com o pastor/instrutor
└── README.md
```

`material/` está no `.gitignore`: a apostila tem autoria própria e a foto do resumo
é material pessoal seu. O site publica apenas perguntas e respostas reescritas a
partir desse material, nunca o PDF ou a foto originais.

## Editando o conteúdo

Todo o conteúdo de estudo vive em `src/data/conteudo.json`, validado pelo schema em
`src/data/schema.ts`. Para adicionar ou corrigir algo:

1. Edite `conteudo.json` diretamente (é só JSON — pode abrir em qualquer editor de
   texto).
2. Siga o padrão dos itens existentes: toda pergunta, lista, versículo ou item de
   quiz precisa de um campo `fonte` com `tipo` (`apostila`, `banca-anterior`,
   `video-concilio` ou `complemento`).
3. Se `fonte.tipo` for `"complemento"` (informação que não está na apostila), marque
   `verificar: true` — o app mostra um selo "conferir com o pastor/instrutor" para
   esses itens.
4. Rode `npm run validar`. Ele falha se houver:
   - ID duplicado,
   - `correta` de uma questão de quiz que não existe entre as alternativas,
   - referência a um tema (`temaId`) que não existe,
   - pergunta/lista/versículo/quiz sem `fonte`,
   - item `"complemento"` sem `verificar: true`.
5. Rode `npm test` para garantir que nada quebrou, e `npm run build` para confirmar
   que o site continua compilando.

## Publicando (deploy)

> **Nota:** esta pasta (`diaconos-estudo/`) vive dentro do repositório Git do site
> `ibci-site`. Por isso, **não** rode `git init` aqui dentro — isso criaria um
> repositório Git aninhado e confuso. Use o repositório que já existe na raiz do
> `ibci-site` (ou, se preferir manter os dois projetos separados de vez, copie esta
> pasta para outro lugar e crie um repositório novo lá).

O jeito mais simples é a Vercel, direto do GitHub. Passo a passo para quem nunca fez:

### 1. Colocar o projeto no GitHub

Na raiz do `ibci-site` (não dentro de `diaconos-estudo/`):

```bash
git add diaconos-estudo
git commit -m "Adiciona plataforma de estudo do diaconato"
git push
```

(Se o `ibci-site` ainda não tem um repositório remoto no GitHub, crie um vazio em
[github.com/new](https://github.com/new) e siga as instruções que o próprio GitHub
mostra para "push an existing repository".)

### 2. Importar na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) (dá para entrar direto com a
   conta do GitHub).
2. Clique em **Add New → Project**.
3. Escolha o repositório do `ibci-site`.
4. **Importante:** como o app do diaconato não está na raiz do repositório, abra
   **"Edit" ao lado de "Root Directory"** e selecione `diaconos-estudo`. A Vercel
   detecta sozinha que é um projeto Vite a partir daí — não precisa mudar mais
   nada. Clique em **Deploy**.
5. Em alguns minutos você recebe um link público (algo como
   `nome-do-projeto.vercel.app`) — esse é o link para compartilhar com a turma.

> Isso cria um projeto Vercel separado do seu site principal, mesmo os dois vivendo
> no mesmo repositório GitHub — cada um com seu próprio link e seus próprios
> deploys.

### 3. Publicando atualizações depois

Sempre que quiser atualizar o conteúdo (por exemplo, depois de editar
`conteudo.json`):

```bash
git add .
git commit -m "Atualiza conteúdo de estudo"
git push
```

A Vercel publica a nova versão automaticamente a cada `push` na branch `main`.

> Alternativa: o [Netlify](https://netlify.com) funciona de forma muito parecida —
> "New site from Git", escolher o repositório, e ele detecta o comando de build
> (`npm run build`) e a pasta de saída (`dist`) sozinho.

## Relatório de conteúdo

- **43** perguntas orais (25 vindas diretamente das perguntas e respostas da
  apostila, 12 do resumo/vídeo do concílio anterior, 6 específicas dos grupos da
  Trilha Essenciais).
- **10** listas para decorar (as 3 mesas, os 2 oficiais, as 3 características de
  At 6:3, os 5 objetivos, os 6 princípios batistas, os 19 artigos doutrinários, os
  10 compromissos do Pacto, os 7 primeiros diáconos, as formas de governo, os tipos
  de disciplina).
- **14** versículos no mapa versículo → tema.
- **48** questões de múltipla escolha (28 na Trilha Essenciais — 4 por grupo × 7
  grupos —, mais 20 geradas a partir do banco oral e de outros temas).
- **6** itens marcados `verificar: true` — veja a lista completa em
  [REVISAR.md](./REVISAR.md).
- **5** itens de fonte `"video-concilio"` (confirmados pela transcrição real do
  concílio — regra dos 80%, elementos da Ceia, sabedoria em Tiago 1:5/3:17,
  conceitos de transubstanciação/consubstanciação) e **2** de fonte
  `"complemento"` (só no seu resumo manuscrito, sem confirmação no vídeo ou na
  apostila).

Rode `npm run validar` a qualquer momento para ver esses números atualizados.

## Fora do escopo (por decisão do projeto)

Login, cadastro, ranking entre alunos, backend, banco de dados, chat com IA,
reconhecimento de voz, pagamentos e painel administrativo.

---

Material de apoio ao estudo. O conteúdo oficial é a apostila do curso e a
orientação do seu pastor.

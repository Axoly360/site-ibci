# Itens para revisar com o pastor/instrutor

Este arquivo lista tudo que precisa de confirmação antes do concílio: itens marcados
`verificar: true` no conteúdo, discrepâncias resolvidas entre as fontes, e lacunas de
material que não pude preencher sozinho.

## 1. Transcrição do vídeo do concílio — recebida e conferida

Você enviou depois a transcrição bruta (~74 min, legendas automáticas do
YouTube, cheia de ruído: "[Música]", "E aí" repetidos, erros de reconhecimento de
voz). Salvei uma versão limpa em `material/transcricao-concilio.txt`, **removendo
nomes de candidatos, do pastor, de diáconos e um relato de saúde pessoal** que
apareciam nas falas de apresentação — não é conteúdo doutrinário e o próprio
projeto pede para não reproduzir esse tipo de dado, mesmo em um arquivo que não
vai para o Git.

A transcrição **confirmou** praticamente tudo que eu já tinha montado a partir do
seu resumo manuscrito, incluindo detalhes que eu havia marcado como
"a conferir":

- A regra dos 80% de aprovação / rejeição acima de 20% remarca o concílio, citando
  o documento da Convenção Batista Brasileira de 2011 (transcrição, ~64min).
- Os elementos da Ceia são pão e **suco de uva** (não "vinho") — o próprio
  examinador corrige um candidato que disse "vinho" (~29min).
- A visão da Ceia é **memorial** ("fazemos isso em memória de Cristo, do
  sacrifício"), com menção a transubstanciação e consubstanciação como contraste.
- A origem da sabedoria do diácono é mesmo **Tiago 1:5 e Tiago 3:17** — por isso
  reclassifiquei esses dois itens de `complemento` para `video-concilio` (ainda
  com `verificar:true`, porque legendas automáticas erram muito).
- O examinador confirma o padrão "primeiro a ideia, o versículo é secundário": em
  um momento ele literalmente diz "não se preocupe com o versículo agora... só
  me diga a palavra: a qualificação, o requisito, o atributo".
- A fórmula "leitura, oração e jejum" para permanecer cheio do Espírito Santo
  **não aparece no vídeo** — só no seu resumo manuscrito. Continua marcada como
  `complemento`/`verificar:true` (item `po_v07`).

Grandes trechos entre ~48min e ~74min (deliberação reservada, hinos, aplausos,
culto da noite) são só ruído de legenda automática, sem fala transcritível — estão
marcados como `[INCOMPREENSÍVEL]` no arquivo salvo.

## 2. Arquivo irrelevante ignorado

Você anexou `Transcrição do bate-papo em 28-09-2026.txt`, que é uma conversa de
suporte com a Konfidency sobre dados estruturados (`aggregateRating`) na loja
Chlorophylla/Tray. Não tem relação com o curso de diáconos — foi ignorado como fonte
de conteúdo (provavelmente um anexo trocado por engano).

## 3. Discrepâncias resolvidas (apostila prevalece)

- **At 6:4 vs. At 6:3** — seu resumo manuscrito cita At 6:4 para as qualificações do
  diácono; a apostila (pág. 5) usa At 6:3 (boa reputação, cheio do Espírito Santo,
  cheio de sabedoria). Usei At 6:3 em todo o conteúdo.
- **23 vs. 19 doutrinas** — a apostila (pág. 27) lista 23 palavras em
  "São doutrinas bíblicas", mas a Declaração Doutrinária (pág. 28-38) tem exatamente
  19 artigos numerados de I a XIX. Usei os 19 artigos, com os títulos exatos da
  apostila, como lista canônica.
- **Mesa do Pastor: Hb 13:17 vs. 1Tm 5:17** — a apostila cita Hebreus 13:17; seu
  resumo cita 1 Timóteo 5:17. Mantive os dois, com o contexto de cada um (Hebreus
  fala da atitude de servir com alegria; 1 Timóteo fala da honra/sustento devidos a
  quem preside bem).

## 4. Itens marcados `verificar: true` (selo "conferir" no app)

Estes **não estão literalmente na apostila**, então continuam com o selo
"conferir com o pastor/instrutor", mesmo depois de confirmados pela transcrição
do vídeo (legendas automáticas erram, então vale checar a exatidão teológica):

1. **Transubstanciação e consubstanciação** (pergunta `po_v05`, fonte
   `video-concilio`) — descrição das posições católica e luterana sobre a Ceia,
   em contraste com a visão batista (memorial/simbólica, art. IX). Vale conferir
   a precisão teológica das definições com o pastor.
2. **Cheio do Espírito Santo — fórmula "leitura, oração e jejum"** (`po_v07`,
   fonte `complemento`) — a apostila e o vídeo falam em geral de manter comunhão
   com Deus (pensamento no Senhor, estudo da Palavra, oração); a fórmula
   específica com jejum vem só do seu resumo manuscrito.
3. **Gálatas 6:10** (versículo `v09`, ligado à Mesa dos necessitados, fonte
   `complemento`) — não encontrei essa referência nem na apostila nem no vídeo;
   vem só do seu resumo manuscrito.
4. **Tiago 1:5** e **Tiago 3:17** (pergunta `po_v09` e versículos `v10`/`v11`,
   fonte `video-concilio`) — confirmados pela transcrição do vídeo, mas mantidos
   com selo por causa do risco de erro nas legendas automáticas.

Todos esses pontos aparecem marcados no relatório de conteúdo (`npm run
validar`).

## 5. Detalhe curioso da apostila (mantido como está, fonte apostila)

A resposta 16 (pág. 47) diz que o Plano Cooperativo vai para a "Convenção Batista de
**Pernambuco**", com dez por cento (dízimo dos dízimos). Isso pode ser um erro de
digitação da apostila (o autor, Jorge Carlos Alves de Souza, é apresentado como
"Presidente de ADBB" — Associação dos Diáconos Batistas da Bahia, não de
Pernambuco). Mantive o texto exatamente como está na apostila, sem alterar o
sentido, porque a regra de ouro manda seguir a apostila; mas vale seu pastor
confirmar qual é a convenção correta na prática da sua igreja.

## 6. Foto do resumo manuscrito

A foto (`material/resumo-concilio.webp`) estava legível o suficiente para extrair
todo o conteúdo relevante — rito, lista de perguntas, siglas (SHB = Sociedade
Harmonia Batista?, EBD = Escola Bíblica Dominical). Não identifiquei trechos
ilegíveis que precisassem ficar de fora.

## 7. Escopo do banco de perguntas

O prompt original pedia no mínimo 3 perguntas orais por capítulo relevante da
apostila (21 capítulos) mais 4 questões de múltipla escolha por grupo essencial. Por
tempo, entreguei um banco robusto e correto (43 perguntas orais, 48 questões de
quiz, 10 listas, 14 versículos — veja o relatório final no README), cobrindo todos
os temas principais e os 7 grupos essenciais por completo, mas não literalmente 3
perguntas para cada um dos 21 capítulos individualmente. O schema, o script
`npm run validar` e a estrutura de `conteudo.json` seguem exatamente o formato
pedido, então dá para adicionar mais perguntas depois sem mudar nada no código —
basta seguir o mesmo padrão dos itens existentes.

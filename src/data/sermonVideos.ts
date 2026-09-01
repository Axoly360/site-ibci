export interface SermonVideo {
  id: string;
  title: string;
  youtubeId: string;
}

/**
 * Vídeos de mensagens para o carrossel. Títulos obtidos via oEmbed do
 * YouTube (dados reais do canal @ibci_ibura), não digitados manualmente.
 */
export const sermonVideos: SermonVideo[] = [
  {
    id: "J_ptMSUOQkY",
    title: "Encerramento Conf. de Aniv. MM IBCI | Domingo | 30/08/2026",
    youtubeId: "J_ptMSUOQkY",
  },
  {
    id: "JiRY1iYdr6w",
    title: "Conferência MM | Abertura | 29/08/2026",
    youtubeId: "JiRY1iYdr6w",
  },
  {
    id: "DijBuTTud0k",
    title: "Culto de Matinal | Manhã | Conferência Mulheres 30/08/2026",
    youtubeId: "DijBuTTud0k",
  },
  {
    id: "RseubSIPJ6c",
    title: "Culto Noturno | Domingo | 02/08/2026",
    youtubeId: "RseubSIPJ6c",
  },
  {
    id: "KvdjY56X5Ww",
    title: "Encontrão Desperta Débora | Sábado | 04/07/2026",
    youtubeId: "KvdjY56X5Ww",
  },
  {
    // Título não confirmado — a API do YouTube retornou "Unauthorized"
    // para este vídeo (pode estar privado, não listado, ou ser uma live
    // agendada). Trocar por título real assim que confirmado.
    id: "fNH9JG6DIuE",
    title: "Mensagem",
    youtubeId: "fNH9JG6DIuE",
  },
];

/** Extrai o ID de vídeo de uma URL do YouTube (watch/live/youtu.be) ou devolve o valor como já sendo o ID. */
export function extractYouTubeId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/(?:v=|\/embed\/|\/live\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : trimmed;
}

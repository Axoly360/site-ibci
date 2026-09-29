export function SeloConferir() {
  return <span className="selo-conferir">⚠ conferir com o pastor/instrutor</span>;
}

export function SeloEssencial() {
  return <span className="selo-essencial">★ Essencial</span>;
}

export function SeloFrequencia({ frequencia }: { frequencia: "alta" | "media" | "baixa" }) {
  if (frequencia !== "alta") return null;
  return <span className="selo-essencial">Cai bastante na banca</span>;
}

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ConteudoSchema, validarRegrasDeNegocio } from "../src/data/schema.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const caminho = resolve(__dirname, "../src/data/conteudo.json");
const bruto = readFileSync(caminho, "utf-8");
const json = JSON.parse(bruto);

const resultado = ConteudoSchema.safeParse(json);

if (!resultado.success) {
  console.error("Erro de schema (Zod):");
  for (const issue of resultado.error.issues) {
    console.error(`  - [${issue.path.join(".")}] ${issue.message}`);
  }
  process.exit(1);
}

const issues = validarRegrasDeNegocio(resultado.data);

if (issues.length > 0) {
  console.error("Erros de regra de negócio:");
  for (const issue of issues) {
    console.error(`  - ${issue.mensagem}`);
  }
  process.exit(1);
}

const c = resultado.data;
const porOrigem: Record<string, number> = {};
for (const p of c.perguntasOrais) {
  porOrigem[p.fonte.tipo] = (porOrigem[p.fonte.tipo] ?? 0) + 1;
}
for (const v of c.versiculos) {
  porOrigem[v.fonte.tipo] = (porOrigem[v.fonte.tipo] ?? 0) + 1;
}
for (const l of c.listas) {
  porOrigem[l.fonte.tipo] = (porOrigem[l.fonte.tipo] ?? 0) + 1;
}
for (const q of c.quiz) {
  porOrigem[q.fonte.tipo] = (porOrigem[q.fonte.tipo] ?? 0) + 1;
}

const totalVerificar =
  c.perguntasOrais.filter((p) => p.verificar).length +
  c.versiculos.filter((v) => v.verificar).length +
  c.listas.filter((l) => l.verificar).length +
  c.quiz.filter((q) => q.verificar).length;

console.log("Conteúdo válido!");
console.log(`  Temas: ${c.temas.length}`);
console.log(`  Perguntas orais: ${c.perguntasOrais.length}`);
console.log(`  Listas: ${c.listas.length}`);
console.log(`  Versículos: ${c.versiculos.length}`);
console.log(`  Quiz: ${c.quiz.length}`);
console.log(`  Itens por tipo de fonte:`, porOrigem);
console.log(`  Itens marcados com verificar:true: ${totalVerificar}`);

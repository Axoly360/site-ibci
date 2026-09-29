import { Link } from "react-router-dom";

const PASSOS = [
  {
    titulo: "1. Abertura",
    texto: "Leitura de Atos 6:1-3 e oração.",
  },
  {
    titulo: "2. Fala inicial do examinador",
    texto:
      "Ele lembra 1 Timóteo 3:10: vocês foram 'provados' — se chegaram até aqui é porque a igreja não achou nada que os desabone. Não se exige grau escolar. O clima costuma ser descontraído.",
  },
  {
    titulo: "3. Sua apresentação",
    texto:
      "Cada candidato fala de si: nome, estado civil e filhos, há quantos anos é convertido, há quanto tempo está na igreja, e se houve mudança de vida depois de encontrar Jesus. Veja a aba 'Minha fala' para ensaiar isso.",
  },
  {
    titulo: "4. Perguntas do examinador",
    texto:
      "Perguntas individuais sobre o conteúdo da apostila. O examinador costuma pedir primeiro a ideia e só às vezes o versículo; às vezes ele mesmo diz que não precisa citar o texto, só explicar o ponto.",
  },
  {
    titulo: "5. Perguntas da assembleia",
    texto: "A assembleia também pode fazer perguntas aos candidatos.",
  },
  {
    titulo: "6. Deliberação reservada",
    texto:
      "Os oficiais se reúnem à parte para decidir. A aprovação exige 80% dos oficiais presentes; com rejeição acima de 20%, o concílio é remarcado.",
  },
  {
    titulo: "7. Resultado e consagração",
    texto: "Comunicação do resultado, consagração no culto da noite, leitura da ata, certificado, oração e pregação.",
  },
];

export default function ComoEOConcilio() {
  return (
    <div className="flex flex-col gap-6">
      <div className="cartao">
        <p className="italic text-slate-600 dark:text-slate-300">
          "Não é casca de banana, não é armadilha." O clima é descontraído. Ninguém é reprovado por esquecer uma
          palavra — se não lembrar de algo, diga isso com calma, sem se desesperar.
        </p>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold">O rito, passo a passo</h2>
        <ol className="flex flex-col gap-3">
          {PASSOS.map((p) => (
            <li key={p.titulo} className="cartao">
              <p className="font-medium">{p.titulo}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cartao">
        <h2 className="mb-1 font-semibold">Como a banca decide</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          A aprovação exige 80% dos oficiais presentes. Se a rejeição passar de 20%, o concílio é remarcado. Não é
          preciso selo de conferência para participar.
        </p>
      </section>

      <section className="cartao">
        <h2 className="mb-1 font-semibold">Como responder</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Comece pela ideia central da resposta; cite o versículo depois, se lembrar. Seja objetivo e fale com suas
          próprias palavras — não é preciso decorar frase por frase.
        </p>
      </section>

      <Link to="/simulado" className="botao-primario text-center">
        Ir para o Simulado
      </Link>
    </div>
  );
}

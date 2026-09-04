import type { ChurchInfo, NavLink } from "@/types";

/**
 * Gerador do payload estático BR Code (padrão EMV do Banco Central) para PIX.
 * Referência: Manual de Padrões para Iniciação do PIX (BACEN).
 *
 * Cada campo segue o formato TLV: ID (2 dígitos) + Length (2 dígitos) + Value.
 * O CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF) é calculado sobre
 * todo o payload, incluindo o próprio ID/Length do campo 63 ("6304").
 */
function emvField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

function crc16ccitt(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Remove acentuação, mantendo apenas caracteres ASCII (exigência do EMV). */
function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

interface PixPayloadInput {
  key: string;
  merchantName: string;
  merchantCity: string;
  txid?: string;
  /** Valor fixo opcional, em reais (ex.: "10.00"). Omitido = PIX sem valor definido. */
  amount?: string;
}

export function generatePixPayload({
  key,
  merchantName,
  merchantCity,
  txid = "***",
  amount,
}: PixPayloadInput): string {
  const merchantAccountInfo = emvField(
    "26",
    emvField("00", "br.gov.bcb.pix") + emvField("01", key)
  );

  const fields = [
    emvField("00", "01"), // Payload Format Indicator
    emvField("01", "11"), // Point of Initiation Method (11 = estático)
    merchantAccountInfo, // Informações da conta PIX (GUI + chave)
    emvField("52", "0000"), // Merchant Category Code
    emvField("53", "986"), // Moeda (986 = BRL)
  ];

  if (amount) {
    fields.push(emvField("54", amount));
  }

  fields.push(
    emvField("58", "BR"), // País
    emvField("59", stripAccents(merchantName).toUpperCase().slice(0, 25)), // Nome do recebedor
    emvField("60", stripAccents(merchantCity).toUpperCase().slice(0, 15)), // Cidade do recebedor
    emvField("62", emvField("05", txid)) // Additional Data Field (TXID)
  );

  const payloadWithCrcTag = fields.join("") + "6304";
  const crc = crc16ccitt(payloadWithCrcTag);

  return payloadWithCrcTag + crc;
}

export const churchInfo: ChurchInfo = {
  name: "IBCI",
  shortName: "IBCI",
  fullName: "Igreja Batista Central do Ibura",
  seniorPastor: "Pr. Márcio Severino",
  address: {
    street: "Av. Rio Grande, 72",
    neighborhood: "COHAB",
    city: "Recife",
    state: "PE",
    zip: "51280-030",
    full: "Av. Rio Grande, 72 - COHAB, Recife - PE, 51280-030",
    mapsUrl: "https://maps.app.goo.gl/FLToSDAYoKsqYJ656",
  },
  serviceTimes: [
    {
      day: "Domingo",
      label: "Culto Matinal",
      time: "08h30",
    },
    {
      day: "Domingo",
      label: "Escola Bíblica Dominical",
      time: "10h00",
    },
    {
      day: "Domingo",
      label: "Culto Noturno",
      time: "18h00",
    },
    {
      day: "Quarta-feira",
      label: "Culto de Oração",
      time: "19h00",
    },
  ],
  weeklySchedule: [
    {
      day: "Terça-feira",
      title: "Visitação",
      time: "14h00",
      description: "Equipe de visitação levando cuidado e a Palavra aos membros e à comunidade.",
    },
    {
      day: "Quarta-feira",
      title: "Culto de Oração",
      time: "19h00",
      description: "Ensino da Palavra e tempo de oração em comunhão.",
    },
    {
      day: "Quarta-feira",
      title: "Uniões",
      time: "20h00",
      description: "Encontro das uniões da igreja em estudo e comunhão.",
    },
    {
      day: "Quinta-feira",
      title: "Jardim de Oração",
      time: "14h30",
      description: "Momento de intercessão e oração em comunhão.",
    },
    {
      day: "Sexta-feira",
      title: "Melhor Idade",
      time: "19h00",
      description: "Encontro do ministério da Melhor Idade.",
    },
    {
      day: "Sexta-feira",
      title: "Mensageiras do Rei / Embaixadores do Rei",
      time: "19h00",
      description: "Encontro dos ministérios infanto-juvenis Mensageiras do Rei e Embaixadores do Rei.",
    },
    {
      day: "Domingo",
      title: "Culto Matinal",
      time: "08h30",
      description: "Culto de celebração no período da manhã.",
    },
    {
      day: "Domingo",
      title: "Escola Bíblica Dominical",
      time: "10h00",
      description: "Estudo bíblico em classes para todas as idades.",
    },
    {
      day: "Domingo",
      title: "Culto Noturno",
      time: "18h00",
      description: "Momento de louvor, adoração e pregação da Palavra.",
    },
  ],
  cnpj: "11.238.163/0001-08",
  pix: {
    key: "11.238.163/0001-08",
    keyRaw: "11238163000108",
    keyType: "CNPJ",
    holder: "Igreja Batista Central do Ibura",
    merchantName: "IGREJA BATISTA IBCI",
    merchantCity: "RECIFE",
    txid: "IBCI01",
  },
  bank: {
    name: "Banco do Brasil",
    agency: "3613-7",
    account: "158106-6",
    accountType: "Conta Corrente",
  },
  social: {
    youtube: "https://www.youtube.com/@ibci_ibura",
    instagram: "https://www.instagram.com/ibci_ibura/",
    whatsapp: "https://wa.me/5581988953552",
    whatsappNumber: "5581988953552",
  },
  contact: {
    email: "contato.ibci@gmail.com",
    phone: "(81) 3475-1778",
    whatsapp: "(81) 98895-3552",
    businessHours: "Segunda a Sexta das 8h às 17h",
  },
};

/**
 * Árvore oficial de navegação (aprovada). "Início" foi removido de propósito —
 * a logo no cabeçalho já leva para a Home. "Central do Membro" e "Culto Ao
 * Vivo" não têm submenu por design: o primeiro é a porta de entrada da área
 * restrita, o segundo é sempre um CTA isolado.
 */
export const navLinks: NavLink[] = [
  { label: "Central do Membro", href: "/central-do-membro" },
  {
    label: "A Igreja",
    href: "/a-igreja",
    children: [
      { label: "Nossa História", href: "/a-igreja/nossa-historia" },
      { label: "Em que Cremos", href: "/a-igreja/em-que-cremos" },
      { label: "Liderança", href: "/a-igreja/lideranca" },
      { label: "Missão, Valores e Visão", href: "/a-igreja/missao-valores-e-visao" },
      { label: "Estatuto IBCI", href: "/a-igreja/estatuto-ibci" },
      { label: "Nossa Congregação", href: "/a-igreja/nossa-congregacao" },
      { label: "Memorial IBCI", href: "/a-igreja/memorial-ibci" },
    ],
  },
  {
    label: "Ministérios",
    href: "/ministerios",
    children: [
      { label: "Pastoral", href: "/ministerios/pastoral" },
      { label: "Diaconal", href: "/ministerios/diaconal" },
      { label: "Louvor", href: "/ministerios/louvor" },
      { label: "Infantil", href: "/ministerios/infantil" },
      { label: "Jovens", href: "/ministerios/jovens" },
      { label: "Mulheres", href: "/ministerios/mulheres" },
      { label: "Homens", href: "/ministerios/homens" },
      { label: "Educação Cristã", href: "/ministerios/educacao-crista" },
      { label: "Ação Social", href: "/ministerios/acao-social" },
      { label: "Família", href: "/ministerios/familia" },
    ],
  },
  {
    label: "Para você",
    href: "/para-voce",
    children: [
      { label: "Dízimos e Ofertas", href: "/para-voce/dizimos-e-ofertas" },
      { label: "Servir", href: "/para-voce/servir" },
      { label: "Eventos", href: "/para-voce/eventos" },
      { label: "Pedidos de Oração", href: "/para-voce/pedidos-de-oracao" },
      { label: "Mensagens", href: "/para-voce/mensagens" },
      { label: "Cursos", href: "/para-voce/cursos" },
      { label: "IBCI News", href: "/para-voce/ibci-news" },
      { label: "Projeto PEPE", href: "/para-voce/projeto-pepe" },
      { label: "Programações", href: "/para-voce/programacoes" },
      { label: "Fale Conosco", href: "/contato#formulario" },
      { label: "Privacidade", href: "/para-voce/privacidade" },
    ],
  },
  {
    label: "Contato",
    href: "/contato",
    children: [
      { label: "Telefone", href: "/contato#telefone" },
      { label: "WhatsApp", href: "/contato#whatsapp" },
      { label: "Email", href: "/contato#email" },
      { label: "Horário de Atendimento", href: "/contato#horario" },
      { label: "Fale Conosco", href: "/contato#formulario" },
    ],
  },
];

/** Links curados do rodapé — não precisa replicar a árvore inteira do header. */
export const footerLinks: NavLink[] = [
  { label: "A Igreja", href: "/a-igreja" },
  { label: "Ministérios", href: "/ministerios" },
  { label: "Para você", href: "/para-voce" },
  { label: "Contato", href: "/contato" },
  { label: "Central do Membro", href: "/central-do-membro" },
];

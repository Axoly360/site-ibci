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
    street: "Rua Pintor Antônio de Albuquerque, 48",
    neighborhood: "Ibura",
    city: "Recife",
    state: "PE",
    zip: "51220-100",
    full: "Rua Pintor Antônio de Albuquerque, 48 - Ibura, Recife - PE, 51220-100",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Rua+Pintor+Ant%C3%B4nio+de+Albuquerque%2C+48+-+Ibura%2C+Recife+-+PE%2C+51220-100",
  },
  serviceTimes: [
    {
      day: "Domingo",
      label: "Escola Bíblica Dominical",
      time: "09h00",
    },
    {
      day: "Domingo",
      label: "Culto de Celebração",
      time: "18h00",
    },
    {
      day: "Quarta-feira",
      label: "Culto de Oração e Doutrina",
      time: "19h30",
    },
  ],
  weeklySchedule: [
    {
      day: "Domingo",
      title: "Escola Bíblica Dominical",
      time: "09h00",
      description: "Estudo bíblico em classes para todas as idades.",
    },
    {
      day: "Domingo",
      title: "Culto de Celebração",
      time: "18h00",
      description: "Momento de louvor, adoração e pregação da Palavra.",
    },
    {
      day: "Quarta-feira",
      title: "Culto de Oração e Doutrina",
      time: "19h30",
      description: "Ensino da Palavra e tempo de oração em comunhão.",
    },
    {
      day: "Sábado",
      title: "Rede de Jovens",
      time: "19h00",
      description: "Encontro da juventude com louvor, comunhão e estudo.",
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
    email: "contato@ibcirecife.org.br",
    phone: "(81) 98895-3552",
  },
};

export const navLinks: NavLink[] = [
  { label: "Início", href: "/" },
  { label: "A Igreja", href: "/quem-somos" },
  { label: "Ministérios", href: "/quem-somos#ministerios" },
  { label: "Mensagens", href: "/#mensagens" },
  { label: "Projetos", href: "/projetos" },
  { label: "Central do Membro", href: "/central-do-membro" },
  { label: "Contribua", href: "/contribuicoes" },
  { label: "Contato", href: "/contato" },
];

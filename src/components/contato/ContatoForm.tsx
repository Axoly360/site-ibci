"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";

const subjects = [
  "Informações",
  "Pedido de Oração",
  "Visita Pastoral",
  "Outros",
] as const;

interface FormData {
  nome: string;
  contato: string;
  assunto: (typeof subjects)[number];
  mensagem: string;
}

const initialForm: FormData = {
  nome: "",
  contato: "",
  assunto: "Pedido de Oração",
  mensagem: "",
};

export default function ContatoForm() {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const text = `Olá! Meu nome é *${formData.nome}*.\nAssunto: *${formData.assunto}*\nContato: ${formData.contato}\n\nMensagem: ${formData.mensagem}`;
    const encodedText = encodeURIComponent(text);

    window.open(
      `https://wa.me/${churchInfo.social.whatsappNumber}?text=${encodedText}`,
      "_blank"
    );

    setSubmitted(true);
    setFormData(initialForm);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="nome"
          className="mb-1.5 block text-sm font-semibold text-text-neutral"
        >
          Nome Completo
        </label>
        <input
          id="nome"
          type="text"
          required
          value={formData.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          placeholder="Seu nome completo"
          className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm text-text-neutral outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label
          htmlFor="contato"
          className="mb-1.5 block text-sm font-semibold text-text-neutral"
        >
          E-mail ou Telefone/WhatsApp
        </label>
        <input
          id="contato"
          type="text"
          required
          value={formData.contato}
          onChange={(e) => handleChange("contato", e.target.value)}
          placeholder="seuemail@exemplo.com ou (81) 90000-0000"
          className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm text-text-neutral outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label
          htmlFor="assunto"
          className="mb-1.5 block text-sm font-semibold text-text-neutral"
        >
          Assunto
        </label>
        <select
          id="assunto"
          value={formData.assunto}
          onChange={(e) =>
            handleChange("assunto", e.target.value as FormData["assunto"])
          }
          className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm text-text-neutral outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="mensagem"
          className="mb-1.5 block text-sm font-semibold text-text-neutral"
        >
          Mensagem
        </label>
        <textarea
          id="mensagem"
          required
          rows={4}
          value={formData.mensagem}
          onChange={(e) => handleChange("mensagem", e.target.value)}
          placeholder="Escreva sua mensagem ou pedido de oração..."
          className="w-full resize-none rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm text-text-neutral outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 font-semibold text-primary shadow-sm transition-all duration-200 hover:bg-secondary-light"
      >
        {submitted ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Mensagem enviada!
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Enviar via WhatsApp
          </>
        )}
      </button>

      {submitted && (
        <p className="text-center text-sm text-text-neutral/70">
          Abrimos o WhatsApp com sua mensagem pronta. É só confirmar o envio
          por lá!
        </p>
      )}
    </form>
  );
}

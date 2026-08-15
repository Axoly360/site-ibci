import Link from "next/link";
import { Tv, Camera, MessageCircle, MapPin } from "lucide-react";
import { churchInfo, navLinks } from "@/data/churchInfo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark-accent text-white/80">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h3 className="font-heading text-lg font-bold text-white">
            IBCI - {churchInfo.fullName}
          </h3>
          <p className="mt-3 text-sm leading-relaxed">
            Uma família para pertencer, um lugar para servir. Venha fazer
            parte da nossa comunidade de fé em Recife.
          </p>
          <p className="mt-4 flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            {churchInfo.address.full}
          </p>
        </div>

        <div>
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wide text-white">
            Links Rápidos
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-secondary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wide text-white">
            Redes Sociais
          </h4>
          <div className="mt-4 flex gap-4">
            <a
              href={churchInfo.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="rounded-full bg-white/10 p-2 hover:bg-secondary hover:text-primary"
            >
              <Tv className="h-5 w-5" />
            </a>
            <a
              href={churchInfo.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full bg-white/10 p-2 hover:bg-secondary hover:text-primary"
            >
              <Camera className="h-5 w-5" />
            </a>
            <a
              href={churchInfo.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="rounded-full bg-white/10 p-2 hover:bg-secondary hover:text-primary"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
          <p className="mt-4 text-sm">{churchInfo.contact.email}</p>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {year} Igreja Batista Central do Ibura (IBCI). Todos os direitos
        reservados.
      </div>
    </footer>
  );
}

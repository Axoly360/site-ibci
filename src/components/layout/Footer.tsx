import Link from "next/link";
import { Youtube, Instagram, MapPin } from "lucide-react";
import { churchInfo, footerLinks } from "@/data/churchInfo";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12.001 2.003c-5.514 0-9.986 4.472-9.986 9.986 0 1.76.463 3.478 1.343 4.986L2 22l5.194-1.363a9.94 9.94 0 004.807 1.225h.005c5.514 0 9.986-4.472 9.986-9.986 0-2.669-1.04-5.176-2.928-7.062A9.935 9.935 0 0012.001 2.003zm0 18.164h-.004a8.183 8.183 0 01-4.166-1.144l-.299-.177-3.096.812.827-3.02-.194-.31a8.172 8.172 0 01-1.253-4.354c0-4.518 3.678-8.196 8.198-8.196 2.189 0 4.247.854 5.795 2.404a8.145 8.145 0 012.399 5.795c0 4.519-3.678 8.19-8.207 8.19z" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark-accent text-white/80">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/logo-ibci.svg"
              alt="Logo IBCI"
              className="h-12 w-12 shrink-0"
            />
            <h3 className="font-heading text-lg font-bold text-white">
              IBCI - {churchInfo.fullName}
            </h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            Uma família para pertencer, um lugar para servir. Venha fazer
            parte da nossa comunidade de fé em Recife.
          </p>
          <a
            href={churchInfo.address.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-start gap-2 text-sm hover:text-secondary"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            {churchInfo.address.full}
          </a>
        </div>

        <div>
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wide text-white">
            Links Rápidos
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            {footerLinks.map((link) => (
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
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href={churchInfo.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full bg-white/10 p-2 hover:bg-secondary hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href={churchInfo.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="rounded-full bg-white/10 p-2 hover:bg-secondary hover:text-primary"
            >
              <WhatsAppIcon className="h-5 w-5" />
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

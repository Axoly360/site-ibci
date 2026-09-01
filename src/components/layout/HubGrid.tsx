import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";

interface HubItem {
  title: string;
  href: string;
  description: string;
}

interface HubGridProps {
  items: HubItem[];
}

/** Grade de cards usada nas páginas de categoria (A Igreja, Ministérios, Para você). */
export default function HubGrid({ items }: HubGridProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="block h-full">
            <Card className="flex h-full flex-col items-start gap-3 p-6">
              <h2 className="font-heading text-lg font-semibold text-primary">
                {item.title}
              </h2>
              <p className="flex-1 text-sm leading-relaxed text-text-neutral/80">
                {item.description}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-secondary">
                Ver mais
                <ArrowRight className="h-4 w-4" />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

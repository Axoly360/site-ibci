"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, PlayCircle } from "lucide-react";
import { navLinks, churchInfo } from "@/data/churchInfo";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-heading text-lg font-bold text-white sm:text-xl"
          onClick={() => setOpen(false)}
        >
          IBCI
          <span className="hidden font-body text-xs font-normal text-white/70 sm:inline">
            {" "}
            — {churchInfo.fullName}
          </span>
        </Link>

        <div className="hidden items-center gap-4 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-white/90 transition-colors hover:text-secondary"
            >
              {link.label}
            </Link>
          ))}
          <Button
            href={churchInfo.social.youtube}
            external
            variant="primary"
            size="sm"
          >
            <PlayCircle className="h-4 w-4" />
            Culto ao Vivo
          </Button>
        </div>

        <button
          type="button"
          className="text-white xl:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-primary xl:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button
              href={churchInfo.social.youtube}
              external
              variant="primary"
              size="sm"
              className="mt-2 w-full"
            >
              <PlayCircle className="h-4 w-4" />
              Culto ao Vivo
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

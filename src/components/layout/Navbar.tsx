"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, PlayCircle, ChevronDown } from "lucide-react";
import { navLinks, churchInfo } from "@/data/churchInfo";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const closeAll = () => {
    setOpen(false);
    setOpenSections({});
  };

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={closeAll}>
          <img
            src="/logo-ibci.svg"
            alt="Logo IBCI"
            className="h-11 w-11 shrink-0 sm:h-12 sm:w-12"
          />
          <span className="font-heading text-sm font-bold leading-tight text-white sm:text-lg md:text-xl">
            {churchInfo.fullName}
          </span>
        </Link>

        {/* Menu desktop */}
        <div className="hidden items-center gap-1 xl:flex">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.href} className="group relative">
                <Link
                  href={link.href}
                  className="flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:text-secondary"
                  aria-haspopup="true"
                >
                  {link.label}
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>

                <div
                  className="invisible absolute left-0 top-full z-20 min-w-[240px] rounded-xl border border-black/5 bg-white p-2 opacity-0 shadow-lg transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
                  role="menu"
                >
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-text-neutral hover:bg-primary/5 hover:text-primary"
                      role="menuitem"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:text-secondary"
              >
                {link.label}
              </Link>
            )
          )}
          <Button
            href={churchInfo.social.youtube}
            external
            variant="primary"
            size="sm"
            className="ml-2"
          >
            <PlayCircle className="h-4 w-4" />
            Culto Ao Vivo
          </Button>
        </div>

        <button
          type="button"
          className="text-white xl:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </nav>

      {/* Menu mobile */}
      {open && (
        <div className="border-t border-white/10 bg-primary xl:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.href}>
                  <div className="flex items-center justify-between rounded-lg px-1">
                    <Link
                      href={link.href}
                      className="flex-1 rounded-lg px-2 py-2 text-sm font-medium text-white/90 hover:bg-white/5"
                      onClick={closeAll}
                    >
                      {link.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleSection(link.label)}
                      aria-label={`${openSections[link.label] ? "Recolher" : "Expandir"} ${link.label}`}
                      aria-expanded={!!openSections[link.label]}
                      className="p-2 text-white/80"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openSections[link.label] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                  {openSections[link.label] && (
                    <div className="ml-3 flex flex-col gap-1 border-l border-white/10 pl-3">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                          onClick={closeAll}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/5"
                  onClick={closeAll}
                >
                  {link.label}
                </Link>
              )
            )}
            <Button
              href={churchInfo.social.youtube}
              external
              variant="primary"
              size="sm"
              className="mt-2 w-full"
            >
              <PlayCircle className="h-4 w-4" />
              Culto Ao Vivo
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

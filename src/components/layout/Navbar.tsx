"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, PlayCircle, ChevronDown, UserRound } from "lucide-react";
import { navLinks as staticNavLinks, churchInfo } from "@/data/churchInfo";
import Button from "@/components/ui/Button";
import Logo from "@/components/brand/Logo";
import type { NavLink } from "@/types";

interface Session {
  name: string;
  email: string;
}

// Links do menu em pílula com contorno (sistema de design IBCI).
const pill =
  "flex items-center gap-1 whitespace-nowrap rounded-full border-[1.5px] border-outline px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-nevoa";
const plain =
  "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-nevoa";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [session, setSession] = useState<Session | null>(null);
  const [navLinks, setNavLinks] = useState<NavLink[]>(staticNavLinks);

  useEffect(() => {
    fetch("/api/auth/sessao")
      .then((res) => res.json())
      .then((data) => setSession(data.session))
      .catch(() => setSession(null));

    fetch("/api/nav")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.tree) && data.tree.length > 0) setNavLinks(data.tree);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/sair", { method: "POST" });
    setSession(null);
    window.location.href = "/";
  };

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const closeAll = () => {
    setOpen(false);
    setOpenSections({});
  };

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-page">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          onClick={closeAll}
          aria-label="Igreja Batista Central do Ibura — início"
        >
          {/* Celular: só a marca com o nome ao lado. Do tablet para cima: logo horizontal. */}
          <span className="flex items-center gap-2.5 sm:hidden">
            <Logo variant="marca" tone="cores" height={44} alt="" />
            <span className="font-heading text-sm font-semibold leading-tight text-ink">
              Igreja Batista
              <br />
              Central do Ibura
            </span>
          </span>
          <span className="hidden sm:block">
            <Logo variant="horizontal" tone="cores" height={60} />
          </span>
        </Link>

        {/* Menu desktop */}
        <div className="hidden items-center gap-1.5 xl:flex">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.href} className="group relative">
                <Link href={link.href} className={pill} aria-haspopup="true">
                  {link.label}
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>

                <div
                  className="invisible absolute left-0 top-full z-20 min-w-[240px] rounded-2xl border border-hairline bg-marfim p-2 opacity-0 shadow-[var(--shadow-soft)] transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
                  role="menu"
                >
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-nevoa"
                      role="menuitem"
                    >
                      {child.label}
                      {child.value && (
                        <span className="mt-0.5 block text-xs font-normal italic text-ink-muted">
                          {child.value}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={link.href} href={link.href} className={pill}>
                {link.label}
              </Link>
            )
          )}
          <Button
            href={churchInfo.social.youtube}
            external
            variant="sun"
            size="sm"
            className="ml-1.5"
          >
            <PlayCircle className="h-4 w-4" />
            Culto Ao Vivo
          </Button>
          {session ? (
            <button type="button" onClick={handleLogout} className={`ml-1 ${plain}`} title={session.email}>
              <UserRound className="h-4 w-4" />
              Sair
            </button>
          ) : (
            <Link href="/central-do-membro" className={`ml-1 ${plain}`}>
              <UserRound className="h-4 w-4" />
              Entrar
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-full p-1.5 text-ink hover:bg-nevoa xl:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </nav>

      {/* Menu mobile */}
      {open && (
        <div className="border-t border-hairline bg-page xl:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.href}>
                  <div className="flex items-center justify-between rounded-lg px-1">
                    <Link
                      href={link.href}
                      className="flex-1 rounded-lg px-2 py-2 text-sm font-semibold text-ink hover:bg-nevoa"
                      onClick={closeAll}
                    >
                      {link.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleSection(link.label)}
                      aria-label={`${openSections[link.label] ? "Recolher" : "Expandir"} ${link.label}`}
                      aria-expanded={!!openSections[link.label]}
                      className="p-2 text-ink-soft"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openSections[link.label] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                  {openSections[link.label] && (
                    <div className="ml-3 flex flex-col gap-1 border-l border-hairline pl-3">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-nevoa"
                          onClick={closeAll}
                        >
                          {child.label}
                          {child.value && (
                            <span className="mt-0.5 block text-xs italic text-ink-muted">
                              {child.value}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-nevoa"
                  onClick={closeAll}
                >
                  {link.label}
                </Link>
              )
            )}
            <Button
              href={churchInfo.social.youtube}
              external
              variant="sun"
              size="sm"
              className="mt-2 w-full"
            >
              <PlayCircle className="h-4 w-4" />
              Culto Ao Vivo
            </Button>
            {session ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-ink hover:bg-nevoa"
              >
                <UserRound className="h-4 w-4" />
                Sair ({session.email})
              </button>
            ) : (
              <Link
                href="/central-do-membro"
                onClick={closeAll}
                className="mt-1 flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-ink hover:bg-nevoa"
              >
                <UserRound className="h-4 w-4" />
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

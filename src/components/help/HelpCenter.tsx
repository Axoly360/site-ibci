"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import Card from "@/components/ui/Card";
import type { HelpArticle, HelpBlock } from "@/data/helpArticles";

function ArticleBlock({ block }: { block: HelpBlock }) {
  if (block.type === "p") {
    return <p className="text-sm leading-relaxed text-text-neutral/80">{block.text}</p>;
  }
  if (block.type === "ul") {
    return (
      <ul className="list-inside list-disc space-y-1 text-sm leading-relaxed text-text-neutral/80">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-black/10">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead>
          <tr className="bg-primary text-white">
            {block.headers.map((header) => (
              <th key={header} className="px-3 py-2 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-bg-light"}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-text-neutral/80">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface HelpCenterProps {
  articles: HelpArticle[];
}

export default function HelpCenter({ articles }: HelpCenterProps) {
  const categories = useMemo(() => {
    const order: string[] = [];
    for (const article of articles) {
      if (!order.includes(article.category)) order.push(article.category);
    }
    return order;
  }, [articles]);

  const [openCategory, setOpenCategory] = useState<string | null>(categories[0] ?? null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(articles[0]?.slug ?? null);
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return articles.filter((article) => {
      const haystack = [article.title, article.category, ...(article.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, articles]);

  const selectedArticle = articles.find((a) => a.slug === selectedSlug) ?? null;

  const selectArticle = (article: HelpArticle) => {
    setSelectedSlug(article.slug);
    setOpenCategory(article.category);
    setQuery("");
  };

  if (articles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-text-neutral/60">
          Nenhum artigo de ajuda disponível para o seu acesso no momento.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-md">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar artigos de ajuda..."
            className="w-full rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-neutral/40 hover:text-text-neutral"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-2">
          {searchResults ? (
            <Card className="p-3">
              <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-text-neutral/50">
                {searchResults.length} resultado{searchResults.length === 1 ? "" : "s"}
              </p>
              {searchResults.length === 0 ? (
                <p className="px-2 py-2 text-sm text-text-neutral/60">Nenhum artigo encontrado.</p>
              ) : (
                <div className="flex flex-col">
                  {searchResults.map((article) => (
                    <button
                      key={article.slug}
                      type="button"
                      onClick={() => selectArticle(article)}
                      className={`rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/5 ${
                        selectedSlug === article.slug
                          ? "font-semibold text-primary"
                          : "text-text-neutral"
                      }`}
                    >
                      {article.title}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            categories.map((category) => {
              const isOpen = openCategory === category;
              const categoryArticles = articles.filter((a) => a.category === category);
              return (
                <Card key={category} className="overflow-hidden p-0">
                  <button
                    type="button"
                    onClick={() => setOpenCategory(isOpen ? null : category)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left font-heading text-sm font-bold text-primary"
                  >
                    {category}
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="flex flex-col gap-0.5 border-t border-black/5 p-2">
                      {categoryArticles.map((article) => (
                        <button
                          key={article.slug}
                          type="button"
                          onClick={() => selectArticle(article)}
                          className={`rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/5 ${
                            selectedSlug === article.slug
                              ? "font-semibold text-primary"
                              : "text-text-neutral"
                          }`}
                        >
                          {article.title}
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>

        <Card className="p-6 sm:p-8">
          {selectedArticle ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-secondary">
                  {selectedArticle.category}
                </p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-primary">
                  {selectedArticle.title}
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {selectedArticle.blocks.map((block, i) => (
                  <ArticleBlock key={i} block={block} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-neutral/60">
              Selecione um artigo ao lado para ler o conteúdo.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

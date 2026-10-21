import type { ReactNode } from "react";
import Card from "@/components/ui/Card";
import type { Count, MonthPoint } from "@/lib/churchStats";

const PALETTE = [
  { stroke: "stroke-primary", bg: "bg-primary" },
  { stroke: "stroke-secondary", bg: "bg-secondary" },
  { stroke: "stroke-emerald-600", bg: "bg-emerald-600" },
  { stroke: "stroke-sky-500", bg: "bg-sky-500" },
  { stroke: "stroke-violet-600", bg: "bg-violet-600" },
  { stroke: "stroke-amber-500", bg: "bg-amber-500" },
];

export function StatSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-xl font-bold text-primary">{title}</h2>
      {description && <p className="mt-1 text-sm text-text-neutral/60">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "alert";
}) {
  return (
    <Card className={`p-5 ${tone === "alert" ? "border-l-4 border-l-secondary" : ""}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-text-neutral/60">{label}</p>
      <p className="mt-1 font-heading text-3xl font-bold text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-neutral/60">{hint}</p>}
    </Card>
  );
}

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <h3 className="mb-4 font-heading text-base font-semibold text-primary">{title}</h3>
      {children}
    </Card>
  );
}

export function Empty({ text = "Ainda sem dados para mostrar." }: { text?: string }) {
  return <p className="text-sm text-text-neutral/60">{text}</p>;
}

export function BarList({
  items,
  format = (n: number) => String(n),
}: {
  items: Count[];
  format?: (n: number) => string;
}) {
  const max = Math.max(...items.map((i) => i.value), 0);
  if (items.length === 0 || max === 0) return <Empty />;

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="text-text-neutral">{item.label}</span>
            <span className="font-semibold text-primary">{format(item.value)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max((item.value / max) * 100, item.value > 0 ? 2 : 0)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Donut({ items }: { items: Count[] }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return <Empty />;

  const radius = 15.915;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 36 36" className="h-36 w-36 shrink-0 -rotate-90" role="img" aria-label="Gráfico de rosca">
        <circle cx="18" cy="18" r={radius} fill="none" strokeWidth="5" className="stroke-black/5" />
        {items.map((item, i) => {
          const pct = (item.value / total) * 100;
          const circle = (
            <circle
              key={item.label}
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              strokeWidth="5"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={-offset}
              className={PALETTE[i % PALETTE.length].stroke}
            />
          );
          offset += pct;
          return circle;
        })}
      </svg>
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className={`h-3 w-3 shrink-0 rounded-full ${PALETTE[i % PALETTE.length].bg}`} />
            <span className="text-text-neutral">{item.label}</span>
            <span className="font-semibold text-primary">
              {item.value} ({Math.round((item.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MonthBars({
  series,
  format = (n: number) => String(n),
}: {
  series: { name: string; bg: string; points: MonthPoint[] }[];
  format?: (n: number) => string;
}) {
  const labels = series[0]?.points ?? [];
  const max = Math.max(...series.flatMap((s) => s.points.map((p) => p.value)), 0);
  if (labels.length === 0 || max === 0) return <Empty />;

  return (
    <div>
      {series.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-4 text-xs text-text-neutral/70">
          {series.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-sm ${s.bg}`} />
              {s.name}
            </span>
          ))}
        </div>
      )}
      <div className="flex h-44 items-end gap-1.5 sm:gap-2">
        {labels.map((point, idx) => (
          <div key={point.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <div className="flex h-full w-full items-end justify-center gap-0.5">
              {series.map((s) => {
                const value = s.points[idx]?.value ?? 0;
                return (
                  <div
                    key={s.name}
                    title={`${s.name} — ${point.label}: ${format(value)}`}
                    className={`w-full max-w-5 rounded-t ${s.bg}`}
                    style={{ height: `${value > 0 ? Math.max((value / max) * 100, 2) : 0}%` }}
                  />
                );
              })}
            </div>
            <span className="w-full truncate text-center text-[10px] text-text-neutral/60">
              {point.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

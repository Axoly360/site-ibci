import { CalendarDays } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import Card from "@/components/ui/Card";

export default function WeeklyScheduleSection() {
  return (
    <section id="cultos" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
          Programação da Semana
        </h2>
        <p className="mt-3 text-text-neutral/80">
          Participe dos nossos encontros e cresça em comunhão com a igreja.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {churchInfo.weeklySchedule.map((item) => (
          <Card key={`${item.day}-${item.title}`} className="p-6">
            <div className="flex items-center gap-2 text-secondary">
              <CalendarDays className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {item.day}
              </span>
            </div>
            <h3 className="mt-3 font-heading text-lg font-semibold text-primary">
              {item.title}
            </h3>
            <p className="mt-1 text-sm font-semibold text-text-neutral">
              {item.time}
            </p>
            <p className="mt-2 text-sm text-text-neutral/80">
              {item.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}

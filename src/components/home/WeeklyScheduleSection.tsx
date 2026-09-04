import { CalendarDays } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import Card from "@/components/ui/Card";
import Carousel from "@/components/ui/Carousel";

interface WeeklyScheduleSectionProps {
  title?: string;
  subtitle?: string;
}

export default function WeeklyScheduleSection({
  title = "Programação da Semana",
  subtitle = "Participe dos nossos encontros e cresça em comunhão com a igreja.",
}: WeeklyScheduleSectionProps = {}) {
  return (
    <section id="cultos" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold text-primary sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-text-neutral/80">{subtitle}</p>
      </div>

      <div className="mt-12">
        <Carousel>
          {churchInfo.weeklySchedule.map((item) => (
            <Card key={`${item.day}-${item.title}`} className="w-64 shrink-0 p-6 sm:w-72">
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
        </Carousel>
      </div>
    </section>
  );
}

import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-lg transition-shadow duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

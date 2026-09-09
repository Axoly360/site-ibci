"use client";

import { FileText } from "lucide-react";
import Button from "@/components/ui/Button";

export default function PrintButton() {
  return (
    <div className="mt-6">
      <Button onClick={() => window.print()} variant="ghost" size="sm">
        <FileText className="h-4 w-4" />
        Salvar / Imprimir
      </Button>
    </div>
  );
}

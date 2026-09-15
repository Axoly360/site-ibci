import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import DocumentViewer from "@/components/documentos/DocumentViewer";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Estatuto IBCI | IBCI - Igreja Batista Central do Ibura",
  description: "Estatuto e Regimento Interno da Igreja Batista Central do Ibura.",
};

export default async function EstatutoIbciPage() {
  const texts = await getAllContent();

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Estatuto IBCI"
        description="Documentos oficiais da Igreja Batista Central do Ibura."
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <DocumentViewer
          tabs={[
            { key: "estatuto", label: "Estatuto", url: texts["documentos.estatuto.url"] ?? null },
            {
              key: "regimento",
              label: "Regimento Interno",
              url: texts["documentos.regimento.url"] ?? null,
            },
          ]}
        />
      </div>
    </div>
  );
}

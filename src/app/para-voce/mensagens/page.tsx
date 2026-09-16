import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import LatestSermonSection from "@/components/home/LatestSermonSection";
import { getSermonVideos } from "@/lib/sermonVideos";

export const metadata: Metadata = {
  title: "Mensagens | IBCI - Igreja Batista Central do Ibura",
  description: "Assista às mensagens da Igreja Batista Central do Ibura.",
};

export default async function MensagensPage() {
  const videos = await getSermonVideos();

  return (
    <div className="bg-bg-light">
      <PageBanner title="Mensagens" />
      <LatestSermonSection videos={videos} />
    </div>
  );
}

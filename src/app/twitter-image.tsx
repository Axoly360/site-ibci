import { OG_SIZE, renderOgImage } from "@/lib/ogImage";

export const alt = "IBCI - Igreja Batista Central do Ibura";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function TwitterImage() {
  return renderOgImage();
}

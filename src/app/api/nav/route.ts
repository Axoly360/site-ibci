import { NextResponse } from "next/server";
import { getNavTree } from "@/lib/navItems";

export async function GET() {
  const tree = await getNavTree();
  return NextResponse.json({ tree });
}

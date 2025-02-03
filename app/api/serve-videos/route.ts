import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getVideos } from "@/actions/actions";

export async function GET(req: NextRequest) {
  const videos = await getVideos();
  return NextResponse.json({ videos });
}
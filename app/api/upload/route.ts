import { NextRequest, NextResponse } from "next/server";
import { createPost } from "@/actions/actions";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const description = formData.get('description') as string;
    const video = formData.get('video') as File;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileName = `${userId}-${Date.now()}.mp4`;
    
    const blob = await put(fileName, video, {
      access: 'public',
    });

    const openai = new OpenAI()
    const embedding = await openai.embeddings.create({
      input: description,
      model: "text-embedding-3-small",
    })

    const post = await createPost(userId, blob.url, description, embedding.data[0].embedding);
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

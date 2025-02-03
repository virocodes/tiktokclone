import Sidebar from "@/components/Sidebar"
import VideoFeed from "@/components/VideoFeed"
import { getUser, getVideos } from "@/actions/actions"
import { auth } from "@clerk/nextjs/server"
import { useState } from "react"
import UploadModal from "@/components/UploadModal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function TikTokInterface() {
  const { userId } = await auth();
  const videos = await getVideos(userId) ?? [];
  
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <VideoFeed videos={videos} />
      
    </div>
  )
}
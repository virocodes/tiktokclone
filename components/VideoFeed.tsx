'use client'

import { useEffect, useState } from 'react';
import Video from 'next-video';
import Instaplay from "player.style/instaplay/react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Bookmark, Share2, Plus } from "lucide-react"
import { getUser, likePost, toggleLike } from '@/actions/actions';
import { useAuth } from '@clerk/nextjs';
import { cn } from "@/lib/utils";
import UploadModal from "@/components/UploadModal"
export default function VideoFeed({videos: initialVideos}: {videos: any[]}) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [videos, setVideos] = useState(initialVideos);
    const { userId } = useAuth();

    console.log('Current videos state:', videos.map(v => ({ id: v.id, has_liked: v.has_liked })));

    const handleLike = async (postId: string, index: number) => {
        if (!userId) return;
        
        const isLiked = await toggleLike(userId, postId);
        
        setVideos(currentVideos => 
            currentVideos.map((video, i) => {
                if (i === index) {
                    return {
                        ...video,
                        has_liked: isLiked,
                        likes: Number(video.likes) + (isLiked ? 1 : -1)
                    };
                }
                return video;
            })
        );
    };

    return (
        <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
            {videos.map((video: any, index: number) => {
                console.log('Video data:', video);
                return (
                    <div
                        className="video-container h-screen snap-start snap-always"
                        key={video.id}
                    >
                        <div className="relative h-full flex items-center justify-center bg-black p-4">
                            <div className="relative h-full max-h-screen aspect-[9/16]">
                                <div className="absolute inset-0 bg-black" />
                                <Video
                                    src={video.videoUrl}
                                    className="aspect-[9/16]"
                                    autoPlay={true} // Auto-play is controlled dynamically
                                    muted
                                    loop
                                    theme={Instaplay}
                                />
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/50 rounded-xl" />

                                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                                    <div className="text-sm">
                                        <span className="flex items-center gap-2">
                                            <img 
                                                src={video.profileImage} 
                                                className="w-6 h-6 rounded-full" 
                                                alt={`${video.username}'s profile`}
                                            />
                                            {video.username} • {video.createdAt.toLocaleDateString()}
                                        </span>
                                        <div className="mt-2">{video.description}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="ml-8 flex flex-col items-center space-y-8">
                                <div className="flex flex-col items-center">
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className={cn(
                                            "rounded-full p-4 border-2",
                                            video.has_liked && "text-red-500 border-red-500"
                                        )}
                                        onClick={() => handleLike(video.id, index)}
                                        disabled={!userId}
                                    >
                                        <Heart className={cn(
                                            "w-8 h-8",
                                            video.has_liked && "fill-current"
                                        )} />
                                    </Button>
                                    <span className="text-sm mt-1">{video.likes}</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <Button size="icon" variant="ghost" className="rounded-full p-4 border-2">
                                        <MessageCircle className="w-8 h-8" />
                                    </Button>
                                    <span className="text-sm mt-1">0</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <Button size="icon" variant="ghost" className="rounded-full p-4 border-2">
                                        <Bookmark className="w-8 h-8" />
                                    </Button>
                                    <span className="text-sm mt-1">0</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <Button size="icon" variant="ghost" className="rounded-full p-4 border-2">
                                        <Share2 className="w-8 h-8" />
                                    </Button>
                                    <span className="text-sm mt-1">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
            

            <Button
                onClick={() => setShowUploadModal(true)}
                className="fixed bottom-8 right-8 rounded-full w-14 h-14 bg-red-500 hover:bg-red-600"
            >
                <Plus className="w-6 h-6" />
            </Button>

            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <UploadModal onClose={() => setShowUploadModal(false)} />
                </div>
            )}


        </div>
    )
}

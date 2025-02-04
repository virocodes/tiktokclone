"use client"

import { Button } from "@/components/ui/button";
import { Home, Users, PlusSquare, User, Search, } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
export default function Sidebar() {
  const router = useRouter()
  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-[348px] flex flex-col border-r border-gray-800 p-4">
        <div className="mb-6 ml-1 flex justify-between">
          <h1 className="text-2xl font-bold">TokTik</h1>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-lg font-semibold">
            <Home className="w-5 h-5" />
            For You
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-lg">
            <Users className="w-5 h-5" />
            Following
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-lg">
            <User className="w-5 h-5" />
            Profile
          </Button>
        </nav>

        <SignedOut>
          <Button className="mt-4 w-full bg-red-500 hover:bg-red-500/90" onClick={() => router.push('/sign-in')}>Log in</Button>
        </SignedOut>
      </div>
    </div>
  )
}
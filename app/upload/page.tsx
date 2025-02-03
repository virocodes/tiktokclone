'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload } from 'lucide-react'

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFile) return

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('video', videoFile)

      await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      router.push('/')
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload Video</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="hidden"
              id="video-upload"
            />
            <label 
              htmlFor="video-upload" 
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-lg mb-2">Click to upload video</p>
              <p className="text-sm text-gray-400">MP4 or WebM</p>
              {videoFile && (
                <p className="mt-4 text-green-500">{videoFile.name}</p>
              )}
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Video title"
                className="bg-gray-900 border-gray-700"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Video description"
                className="bg-gray-900 border-gray-700"
                rows={4}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600"
            disabled={!videoFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X } from 'lucide-react'

interface UploadModalProps {
  onClose: () => void;
}

export default function UploadModal({ onClose }: UploadModalProps) {
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
      formData.append('description', description)
      formData.append('video', videoFile)

      await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      onClose()
      router.refresh()
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      router.refresh()
    }
  }

  return (
    <div className="relative bg-black rounded-xl shadow-2xl w-full max-w-2xl p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          Upload Video
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-800 text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-dashed border-gray-800 hover:border-red-500 transition-colors rounded-xl p-8 text-center">
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
            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-lg mb-2 font-medium text-white">Drop your video here</p>
            <p className="text-sm text-gray-400">MP4 or WebM (max 50MB)</p>
            {videoFile && (
              <div className="mt-4 px-4 py-2 bg-gray-900 rounded-lg text-green-400">
                {videoFile.name}
              </div>
            )}
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-300">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video"
              className="bg-black border-gray-800 focus:border-red-500 focus:ring-red-500 text-white"
              rows={4}
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="ghost"
            className="flex-1 border border-gray-800 hover:bg-gray-900 text-white"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            disabled={!videoFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </form>
    </div>
  )
}

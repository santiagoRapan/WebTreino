"use client"

import { useState, useRef, DragEvent, ChangeEvent } from "react"
import { Upload, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  accessToken: string
  onUploadSuccess: (newUrl: string) => void
}

export function AvatarUpload({ currentAvatarUrl, accessToken, onUploadSuccess }: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Only JPEG, PNG, and WebP are allowed."
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`
    }
    return null
  }

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }

    setError(null)
    setSuccess(false)
    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/media/upload-avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = data.retryAfter
          const minutes = Math.ceil(retryAfter / 60)
          throw new Error(`Rate limit exceeded. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`)
        }
        throw new Error(data.error || "Upload failed")
      }

      // Success
      setSuccess(true)
      setError(null)
      onUploadSuccess(data.avatarUrl)

      // Clear selection after success
      setTimeout(() => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setSuccess(false)
      }, 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload avatar"
      setError(message)
      setSuccess(false)
    } finally {
      setUploading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const displayUrl = previewUrl || currentAvatarUrl

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          {displayUrl ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-border">
              <img src={displayUrl} alt="Avatar preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
              <Upload className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Upload className="w-4 h-4" />
              {selectedFile ? "Change image" : "Drop an image or click to upload"}
            </div>
            <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP (max 2MB)</p>
            {selectedFile && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="flex-1">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Avatar
            </>
          )}
        </Button>

        {selectedFile && !uploading && (
          <Button onClick={clearSelection} variant="outline">
            Cancel
          </Button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3">
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            Avatar uploaded successfully!
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}

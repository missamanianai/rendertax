"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { UploadIcon, FileIcon, XIcon } from "lucide-react"

interface FileUploaderProps {
  onFileSelected: (file: File) => void
  acceptedFileTypes: string
  maxSize: number // in MB
  file?: File
}

export function FileUploader({ onFileSelected, acceptedFileTypes, maxSize, file }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileType = file.type
    if (fileType !== "application/pdf") {
      setError("Only PDF files are accepted")
      return false
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return false
    }

    setError(null)
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        onFileSelected(file)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        onFileSelected(file)
      }
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFileSelected(null as any)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <input ref={inputRef} type="file" accept={acceptedFileTypes} onChange={handleChange} className="hidden" />

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-gray-300"
        } ${file ? "bg-gray-50" : ""}`}
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileIcon className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">{file.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemove} className="h-8 w-8 p-0">
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <UploadIcon className="mx-auto h-8 w-8 text-gray-400" />
            <div className="text-sm font-medium">Drag and drop your file here or click to browse</div>
            <div className="text-xs text-gray-500">PDF files only, max {maxSize}MB</div>
          </div>
        )}
      </div>

      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
    </div>
  )
}

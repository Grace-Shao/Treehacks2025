"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"

const UploadFileButton = () => {
  const [fileName, setFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      // Here you would typically handle the file upload to your server
      console.log("File selected:", file)
    }
  }

  return (
    <div className="relative z-10">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center w-64 px-4 py-3 text-black bg-white rounded-md shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
      >
        {fileName ? (
          <span className="truncate">{fileName}</span>
        ) : (
          <>
            <Upload className="mr-2 h-5 w-5" />
            Upload Video
          </>
        )}
      </button>
      <input type="file" ref={fileInputRef} onChange={handleUpload} accept="video/*" className="hidden" />
    </div>
  )
}

export default UploadFileButton


import React, { useState } from 'react'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { uploadDocumentToPinecone } from '../services/api'

const DocumentUpload = ({ onDocumentReady }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Please select a PDF file')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      console.log(selectedFile);

      // Upload to backend
      const documentData = await uploadDocumentToPinecone(selectedFile)
      
      console.log('PDF uploaded !!')

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Notify parent component
      onDocumentReady({
        type: 'uploaded',
        file: selectedFile,
        data: documentData
      })
      console.log("Document id is :",documentData.documentId);

    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Document</h3>
        <p className="text-gray-600">Upload a PDF file of your book or research paper</p>
      </div>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        
        {!selectedFile ? (
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500">PDF files only (Max: 10MB)</p>
          </label>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-primary-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-gray-600 ml-auto"
              disabled={isUploading}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing document...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload & Process
            </>
          )}
        </button>
        
        {selectedFile && !isUploading && (
          <button
            onClick={() => onDocumentReady({
              type: 'uploaded',
              file: selectedFile,
              data: { name: selectedFile.name }
            })}
            className="btn-secondary"
          >
            Ready to Chat
          </button>
        )}
      </div>
    </div>
  )
}

export default DocumentUpload
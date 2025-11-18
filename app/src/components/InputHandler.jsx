import React, { useState } from 'react'
import DocumentUpload from './DocumentUpload'
import ResearchPaperSearch from './ResearchPaper'
import { Upload, Search, BookOpen } from 'lucide-react'

const InputHandler = ({ onDocumentReady }) => {
  const [hasDocument, setHasDocument] = useState(null)
  const [activeTab, setActiveTab] = useState('upload')

  const handleDocumentChoice = (choice) => {
    setHasDocument(choice)
    setActiveTab(choice ? 'upload' : 'search')
  }

  return (
    <div className="card">
      {hasDocument === null && (
        <div className="text-center py-8">
          <BookOpen className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Do you have a PDF of a book or research paper?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Choose whether you want to upload your own document or search for research papers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleDocumentChoice(true)}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Yes, I have a PDF
            </button>
            <button
              onClick={() => handleDocumentChoice(false)}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              No, search for papers
            </button>
          </div>
        </div>
      )}

      {hasDocument !== null && (
        <div>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload PDF
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="w-4 h-4" />
              Search Papers
            </button>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {activeTab === 'upload' && (
              <DocumentUpload onDocumentReady={onDocumentReady} />
            )}
            {activeTab === 'search' && (
              <ResearchPaperSearch onDocumentReady={onDocumentReady} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default InputHandler
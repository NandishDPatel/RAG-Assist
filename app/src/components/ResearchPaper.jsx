import React, { useState } from 'react'
import { Search, Download, Loader2, Check } from 'lucide-react'
import { searchArxivPapers, uploadPaperToPinecone } from '../services/api'

const ResearchPaperSearch = ({ onDocumentReady }) => {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [papers, setPapers] = useState([])
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const results = await searchArxivPapers(query)
      setPapers(results)
    } catch (error) {
      console.error('Search failed:', error)
      alert('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handlePaperSelect = (paper) => {
    setSelectedPaper(paper)
  }

  const handleUploadPaper = async () => {
    if (!selectedPaper) return

    setIsUploading(true)
    try {
      const documentData = await uploadPaperToPinecone(selectedPaper)
      onDocumentReady({
        type: 'arxiv',
        paper: selectedPaper,
        data: documentData
      })
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to process paper. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Research Papers</h3>
        <p className="text-gray-600">Find relevant research papers from arXiv database</p>
      </div>

      {/* Search Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter research topic, keywords, or paper title..."
          className="input-field flex-1"
          onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Search
        </button>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Searching arXiv database...</p>
        </div>
      )}

      {papers.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Top 3 Results:</h4>
          {papers.map((paper, index) => (
            <div
              key={paper.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPaper?.id === paper.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePaperSelect(paper)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1">{paper.title}</h5>
                  <p className="text-sm text-gray-600 mb-2">
                    {paper.authors?.join(', ')}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {paper.summary}
                  </p>
                  {paper.published && (
                    <p className="text-xs text-gray-400 mt-2">
                      Published: {new Date(paper.published).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedPaper?.id === paper.id ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {selectedPaper && (
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleUploadPaper}
            disabled={isUploading}
            className="btn-primary flex items-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isUploading ? 'Processing...' : 'Upload & Start Chat'}
          </button>
          
          <a
            href={selectedPaper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        </div>
      )}
    </div>
  )
}

export default ResearchPaperSearch
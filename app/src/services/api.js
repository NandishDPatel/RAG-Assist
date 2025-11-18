import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api' // Your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Upload document to Pinecone
export const uploadDocumentToPinecone = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// Search arXiv papers
export const searchArxivPapers = async (query) => {
  const response = await api.get('/search/arxiv', {
    params: { query }
  })
  return response.data
}

// Upload arXiv paper to Pinecone
export const uploadPaperToPinecone = async (paper) => {
  const response = await api.post('/upload/arxiv', paper)
  return response.data
}

// Send chat message
export const sendChatMessage = async (message, documentId) => {
  const response = await api.post('/chat', {
    message,
    documentId
  })
  return response.data
}

export default api
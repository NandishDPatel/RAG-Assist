import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Search arXiv papers
export const searchArxivPapers = async (query) => {
  const response = await api.get('/search/arxiv', {
    params: { query, max_results: 3 }
  })
  return response.data.papers
}

export const uploadDocumentToPinecone = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/upload/pdf', formData, {
    timeout: 0, //remove the 30 seconds axios limit
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const uploadPaperToPinecone = async (paper) => {
  const response = await api.post('/upload/arxiv', paper)
  return response.data
}

export const startVoiceRecording = async () => {
  const response = await api.post('/voice/start-recording')
  return response.data
}

export const stopVoiceRecording = async () => {
  const response = await api.post('/voice/stop-recording')
  return response.data
}

// Send chat message
export const sendChatMessage = async (message, documentId) => {
  console.log(documentId);
  const response = await api.post('/chat', {
    message,
    documentId
  })

  return response.data
}

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api
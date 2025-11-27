# Rag Assist

- RAG-Assist is an AI-powered Retrieval-Augmented Generation (RAG) bot designed to make reading, research, and knowledge retrieval seamless. Users can either upload PDFs such as research papers, academic articles, or books, or provide a brief description to fetch relevant papers from the internet. The system converts the content into chunks and stores them in Pinecone, allowing users to perform context-aware Q&A over their documents.
- Tech Stack: Python, FastAPI, React, Tailwind CSS, GPT-4o-mini (LLM), multilingual-e5-large embedding model, LangChain, Pinecone, Google Cloud Speech-to-Text, AI Agents 
- Why RAG-Assist? 
  1. *Never forget context*: When reading books or papers, it’s common to forget details or struggle to locate specific information. RAG-Assist allows users to query the content directly, retrieving precise answers without manually searching.
  2. *Reduced AI hallucinations*: By grounding responses in actual document content and external sources, RAG ensures that answers are accurate and reliable.
  3. *Boost research efficiency*: Quickly find relevant information, cross-reference multiple sources, and accelerate learning or academic work.
  4. *Flexible knowledge retrieval*: Works across multiple document types and online sources, making it versatile for students, researchers, and professionals.

- RAG-Assist bridges the gap between large volumes of information and actionable knowledge, making research and reading more efficient, reliable, and user-friendly.

## Technical flow on Miro
-  Miro Link : [https://miro.com/app/board/uXjVJ3tPldw=/?share_link_id=996466057234](https://miro.com/app/board/uXjVJ3tPldw=/?share_link_id=996466057234)

## Installation

1. Clone the github repo

```bash
git clone https://github.com/NandishDPatel/RAG-Assist.git
cd RAG-Assist
cd api
```
2. Setup the env file inside api folder with valid keys
```bash
PINECONE_API_KEY="pinecone-api-key-goes-here"
GOOGLE_APPLICATION_CREDENTIALS="for-enabling-voice-to-text-gcp-api-goes-here"
OPENAI_API_KEY="your-api-key-goes-here"
```

3. Install python dependencies
```bash
pip install -r requirements.txt
```
4. Run the man.py file for running backend server
```bash
uvicorn main:app --reload 
```
- Check whether your api is running or not by going on [http://localhost:8000/](http://localhost:8000/)
5. Run the frontend on [http://localhost:3000/](http://localhost:3000/)
```bash
cd app
npm run dev
```
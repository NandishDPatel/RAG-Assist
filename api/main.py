from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import tempfile
import traceback
from agents.arxiv_agent import fetch_arxiv_papers
from database.db import PDFProcessor
from agents.voice_agent import start_recording, stop_recording
from rag.retriever import RAGRetriever


app = FastAPI(title="Rag Assist Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pdf_processor = PDFProcessor()

rag = RAGRetriever()


@app.get("/")
async def root():
    return {"message": "Document Chat API is running"}


@app.get("/api/search/arxiv")
async def search_arxiv_papers(query: str, max_results: int = 3):
    try:
        if not query:
            raise HTTPException(status_code=400, detail="Query parameter is required")

        papers = fetch_arxiv_papers(query, max_results)
        return {"success": True, "query": query, "papers": papers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Arxiv search failed: {str(e)}")


@app.post("/api/upload/pdf")
async def upload_pdf_file(file: UploadFile = File(...)):
    tmp_file_path = None
    try:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        # Extract document ID from filename (remove .pdf extension)
        document_id = file.filename.replace(".pdf", "").strip()

        # Check if pdf already exists in Pinecone
        if PDFProcessor.namespace_exists(document_id):
            print("PDF already exists")
            return {
                "success": True,
                "message": "PDF already uploaded — skipping",
                "document_id": document_id,
                "skipped": True,
            }

        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        # Process PDF and upload to Pinecone
        chunks = pdf_processor.pdf_to_pinecone(tmp_file_path, document_id)

        response = {
            "success": True,
            "message": "PDF processed successfully",
            "document_id": document_id,
            "filename": file.filename,
        }
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    finally:
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)


@app.post("/api/upload/arxiv")
async def upload_arxiv_paper(paper_data: dict):
    tmp_file_path = None
    try:
        pdf_url = paper_data.get("pdf_url")
        title = paper_data.get("title", "arxiv_paper")
        paper_id = paper_data.get("id", "")

        if not pdf_url:
            raise HTTPException(status_code=400, detail="PDF URL is required")

        if not paper_id:
            raise HTTPException(status_code=400, detail="Paper ID is required")

        # Use paper ID as document_id
        document_id = paper_id

        # Check if pdf already exists in Pinecone
        if PDFProcessor.namespace_exists(document_id):
            print("Arxiv Paper already exists")
            return {
                "success": True,
                "message": "Research paper already uploaded in Pinecone",
                "document_id": document_id,
                "skipped": True,
            }

        import requests

        response = requests.get(pdf_url, timeout=None)
        response.raise_for_status()

        # Save downloaded PDF temporarily
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
            tmp_file.write(response.content)
            tmp_file_path = tmp_file.name

        # Process arXiv PDF and upload to Pinecone
        chunks = pdf_processor.pdf_to_pinecone(tmp_file_path, document_id)

        result = {
            "success": True,
            "message": "arXiv paper processed successfully",
            "document_id": document_id,  # Return exact paper ID
            "chunks_uploaded": len(chunks),
            "paper_title": title,
            "pdf_url": pdf_url,
            "paper_id": paper_id,
        }
        return result

    except Exception as e:

        raise HTTPException(status_code=500, detail=f"arXiv upload failed: {str(e)}")
    finally:
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)


@app.post("/api/voice/start-recording")
async def api_start_recording():
    try:
        result = start_recording()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recording failed: {str(e)}")


@app.post("/api/voice/stop-recording")
async def api_stop_recording():
    try:
        result = stop_recording()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recording stop failed: {str(e)}")


@app.post("/api/chat")
async def chat_message(chat_data: dict):
    try:
        message = chat_data.get("message", "").strip()
        document_id = chat_data.get("documentId", "").strip()

        if not message:
            raise HTTPException(status_code=400, detail="Message is required")

        if not document_id:
            raise HTTPException(status_code=400, detail="Document ID is required")

        # Get RAG answer
        response = await rag.get_rag_response(message, document_id)

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

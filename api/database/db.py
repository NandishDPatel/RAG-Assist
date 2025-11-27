from dotenv import load_dotenv
import os
import time
from pinecone import Pinecone
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

load_dotenv()
PINECONE_KEY = os.environ.get("PINECONE_API_KEY")

if not PINECONE_KEY:
    print("No PINECONE_API_KEY found in .env file")

pc = Pinecone(PINECONE_KEY)
INDEX_NAME = "rag-assist"

embedding_model = SentenceTransformer("intfloat/multilingual-e5-large")

if not pc.has_index(INDEX_NAME):
    pc.create_index(
        name=INDEX_NAME,
        dimension=1024,
        metric="cosine",
        spec={"serverless": {"cloud": "aws", "region": "us-east-1"}},
    )
    print("Pincone index created successfully!")
else:
    print("Pinecone index already exists")

index = pc.Index(INDEX_NAME)


class PDFProcessor:
    def __init__(self, chunk_size=800, chunk_overlap=80):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.embedding_model = embedding_model

    def load_pdf(self, pdf_path):
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            try:
                text += page.extract_text() + "\n"
            except Exception as e:
                print(f"Error extracting page: {e}")
                continue
        return text

    def split_into_chunks(self, text):
        words = text.split()
        chunks = []
        start = 0
        end = self.chunk_size

        while start < len(words):
            chunk = " ".join(words[start:end])
            if chunk.strip():
                chunks.append(chunk)
            start = end - self.chunk_overlap
            end = start + self.chunk_size

        return chunks

    def embed_text(self, text):
        return self.embedding_model.encode([text])[0].tolist()

    def upload_chunks(self, chunks, pdf_name):
        try:
            print(f"Uploading {len(chunks)} chunks to Pinecone...")
            MAX_BATCH = 20

            # Progress bar on total chunks
            with tqdm(total=len(chunks), desc="Uploading to Pinecone", unit="chunk") as pbar:

                for start_idx in range(0, len(chunks), MAX_BATCH):
                    end_idx = min(start_idx + MAX_BATCH, len(chunks))
                    batch = chunks[start_idx:end_idx]

                    vectors = []
                    for i, chunk in enumerate(batch):
                        global_idx = start_idx + i

                        embedding = self.embed_text(chunk)

                        vector = (
                            f"{pdf_name}-chunk-{global_idx}",
                            embedding,
                            {"text": chunk, "source": pdf_name, "chunk_id": global_idx},
                        )
                        vectors.append(vector)

                    index.upsert(vectors=vectors, namespace=pdf_name)
                    time.sleep(0.3)

                    # update progress bar
                    pbar.update(len(batch))

            print(f"Successfully uploaded {len(chunks)} chunks!")
            return chunks

        except Exception as e:
            print(f"Error uploading chunks: {e}")
            import traceback
            traceback.print_exc()
            return []
  
    def namespace_exists(namespace: str) -> bool:
        try:
            stats = index.describe_index_stats()
            return namespace in stats.get("namespaces", {})
        except Exception as e:
            print(f"Error checking namespace: {e}")
            return False

    
    def pdf_to_pinecone(self, pdf_path, document_id=None):
        pdf_name = document_id or os.path.basename(pdf_path).replace(".pdf", "")
        print(f"\nLoading PDF: {pdf_path}")
        print(f"Using document_id: {pdf_name}")

        text = self.load_pdf(pdf_path)

        print("Splitting into chunks...")
        chunks = self.split_into_chunks(text)
        print(f"Created {len(chunks)} chunks")

        print("Uploading to Pinecone...")
        result = self.upload_chunks(chunks, pdf_name)

        print(f"PDF '{pdf_name}' processed successfully!")
        return result

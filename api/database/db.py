from dotenv import load_dotenv
import os
import time
from pinecone import Pinecone
from pypdf import PdfReader

load_dotenv()
PINECONE_KEY = os.environ.get("PINECONE_API_KEY")
print(f"Pinecone Key: {PINECONE_KEY}")

pc = Pinecone(PINECONE_KEY)
INDEX_NAME = "rag-assist"

if not pc.has_index(INDEX_NAME):
    pc.create_index_for_model(
        name=INDEX_NAME,
        cloud="aws",
        region="us-east-1",
        embed={"model": "multilingual-e5-large", "field_map": {"text": "chunk_text"}},
    )
    print(" Index created successfully!")

index = pc.Index(INDEX_NAME)

class PDFProcessor:
    def __init__(self, chunk_size=800, chunk_overlap=80):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def load_pdf(self, pdf_path):
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            try:
                text += page.extract_text() + "\n"
            except:
                continue
        return text

    def split_into_chunks(self, text):
        words = text.split()
        chunks = []
        start = 0
        end = self.chunk_size
        while start < len(words):
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            start = end - self.chunk_overlap
            end = start + self.chunk_size
        return chunks

    def upload_chunks(self, chunks, pdf_name):
        try:
            print(f" Uploading {len(chunks)} chunks to Pinecone...")
            MAX_BATCH = 90  # must be <= 96

            for start_idx in range(0, len(chunks), MAX_BATCH):
                end_idx = start_idx + MAX_BATCH
                batch = chunks[start_idx:end_idx]

                records = []
                for i, chunk in enumerate(batch):
                    global_idx = start_idx + i
                    records.append({
                        "_id": f"{pdf_name}-chunk-{global_idx}",
                        "text": chunk,
                        "source": pdf_name,
                    })

                index.upsert_records(namespace=pdf_name, records=records)  # namespace per PDF
                print(f" Uploaded batch {start_idx} → {min(end_idx-1, len(chunks)-1)}")

            print(f" Successfully uploaded {len(chunks)} chunks!")
            return True

        except Exception as e:
            print(f" Error uploading chunks: {e}")
            return False

    def pdf_to_pinecone(self, pdf_path):
        pdf_name = os.path.basename(pdf_path).replace(".pdf", "")
        print(f" Loading PDF: {pdf_path}")
        text = self.load_pdf(pdf_path)

        print(" Splitting into chunks...")
        chunks = self.split_into_chunks(text)
        print(f" Created {len(chunks)} chunks")

        print(" Uploading to Pinecone...")
        self.upload_chunks(chunks, pdf_name)

        print(" PDF processed successfully!")
        return chunks

if __name__ == "__main__":
    processor = PDFProcessor()

    # Path to PDF
    pdf_file = "../assets/textbook_of_engineering_matematics.pdf"

    # Process PDF and upload chunks
    chunks = processor.pdf_to_pinecone(pdf_file)
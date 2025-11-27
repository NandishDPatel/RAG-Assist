import os
from dotenv import load_dotenv
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda, RunnablePassthrough

load_dotenv()


class RAGRetriever:
    def __init__(self):
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index_name = "rag-assist"
        self.index = self.pc.Index(self.index_name)
        self.embedding_model = SentenceTransformer("intfloat/multilingual-e5-large")
        self.llm = ChatOpenAI(
            model="gpt-4o-mini", temperature=0.7, api_key=os.getenv("OPENAI_API_KEY")
        )
        self.prompt = ChatPromptTemplate.from_template(
            """
You are a helpful RAG assistant. Your job is to provide the answer based on the provided context of the pdf to you. Otherwise just tell that I'm not aware about the context. 

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""
        )
        self.chain = (
            {
                "context": RunnableLambda(self.retrieve_context),
                "question": RunnablePassthrough(),
            }
            | self.prompt
            | self.llm
            | StrOutputParser()
        )

    def embed_query(self, query: str):
        return self.embedding_model.encode(query).tolist()

    def retrieve_context(self, inputs: dict):
        query = inputs["question"]
        document_id = inputs["documentId"]

        query_emb = self.embed_query(query)

        results = self.index.query(
            vector=query_emb, top_k=3, include_metadata=True, namespace=document_id
        )

        chunks = [m["metadata"]["text"] for m in results["matches"]]
        return "\n\n".join(chunks)

    async def get_rag_response(self, message: str, document_id: str):
        response = await self.chain.ainvoke(
            {"question": message, "documentId": document_id}
        )
        return {"answer": response}

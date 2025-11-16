import os
import requests
import arxiv

def fetch_arxiv_papers(query):

    print(f"Searching arXiv for: {query}\n")
    
    client = arxiv.Client()
    search = arxiv.Search(
        query=query,
        max_results=3,
        sort_by=arxiv.SortCriterion.Relevance
    )
    
    papers = []
    for i, result in enumerate(client.results(search), start=1):
        paper_info = {
            "title": result.title,
            "authors": [author.name for author in result.authors[:5]],
            "summary": result.summary[:150] + "..." if len(result.summary) > 100 else result.summary,
            "pdf_url": result.pdf_url
        }
        papers.append(paper_info)
    
    return papers

def print_books(research_papers):
    print("Top PDF results:")
    for i, pdf in enumerate(research_papers):
        print(f"{i+1}. {pdf}")

if __name__ == "__main__":
    query = "cartilage repair sports knee injury"  # search query here

    result = fetch_arxiv_papers(query)
    
    print_books(result)
    
    
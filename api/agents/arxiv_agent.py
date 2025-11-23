import arxiv

def fetch_arxiv_papers(query: str, max_results: int = 3):
    """
    Search arXiv for research papers
    """
    print(f"🔍 Searching arXiv for: {query}")
    
    try:
        client = arxiv.Client()
        search = arxiv.Search(
            query=query,
            max_results=max_results,
            sort_by=arxiv.SortCriterion.Relevance
        )
        
        papers = []
        for result in client.results(search):
            paper_info = {
                "id": result.entry_id.split('/')[-1],
                "title": result.title,
                "authors": [author.name for author in result.authors],
                "summary": result.summary,
                "abstract": result.summary[:500] + "..." if len(result.summary) > 500 else result.summary,
                "pdf_url": result.pdf_url,
                "published": result.published.strftime("%Y-%m-%d") if result.published else None,
                "url": result.entry_id
            }
            papers.append(paper_info)
        
        print(f"✅ Found {len(papers)} papers")
        return papers
        
    except Exception as e:
        print(f"❌ Error fetching arXiv papers: {e}")
        return []

def print_papers(papers):
    """
    Print papers for debugging
    """
    print("📚 Top PDF results:")
    for i, paper in enumerate(papers, 1):
        print(f"{i}. {paper['title']}")
        print(f"   Authors: {', '.join(paper['authors'][:3])}")
        print(f"   PDF: {paper['pdf_url']}")
        print()
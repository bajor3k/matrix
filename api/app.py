
import os, re, glob
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

PDF_FOLDER = os.environ.get("PDF_FOLDER", r"C:\Users\JoshuaBajorek\Box\Advisor Services\Python")
TOP_K_DOCS = 3            # how many PDFs to return
TOP_K_PAGES_PER_DOC = 2   # how many best pages per doc

app = FastAPI()

# Allow local Next.js dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    question: str
    mode: str  # "simple" | "bullets" | "standard"

class GenerateResponse(BaseModel):
    draft: str
    sources: List[Dict[str, str]]  # [{filename, page, snippet}]

def list_pdfs(folder: str) -> List[str]:
    if not os.path.isdir(folder):
        raise HTTPException(status_code=500, detail=f"PDF folder not found: {folder}")
    files = sorted(glob.glob(os.path.join(folder, "*.pdf")))
    if not files:
        raise HTTPException(status_code=500, detail=f"No PDFs found in: {folder}")
    return files

def extract_pdf_text_by_page(path: str) -> List[str]:
    pages = []
    try:
        with pdfplumber.open(path) as pdf:
            for p in pdf.pages:
                text = p.extract_text() or ""
                # normalize whitespace
                text = re.sub(r"\s+", " ", text).strip()
                pages.append(text)
    except Exception as e:
        # skip corrupt PDFs instead of crashing
        pages.append(f"[Error reading {os.path.basename(path)}: {e}]")
    return pages

def rank_pages(question: str, docs: List[Dict]) -> List[Dict]:
    # Build a flat index of all pages with (doc_idx, page_idx)
    corpus = []
    meta = []
    for di, d in enumerate(docs):
        for pi, page_text in enumerate(d["pages"]):
            corpus.append(page_text)
            meta.append((di, pi))

    if not corpus:
        return []

    vect = TfidfVectorizer(ngram_range=(1,2), stop_words="english", min_df=1)
    X = vect.fit_transform(corpus + [question])
    sims = cosine_similarity(X[-1], X[:-1]).ravel()
    ranked = sorted(
        [{"score": float(sims[i]), "doc_idx": meta[i][0], "page_idx": meta[i][1]} for i in range(len(sims))],
        key=lambda x: x["score"], reverse=True
    )
    return ranked

def build_draft(mode: str, question: str, hits: List[Dict], docs: List[Dict]) -> str:
    # pull a few concise nuggets from the best pages
    bullets = []
    for h in hits[:TOP_K_DOCS * TOP_K_PAGES_PER_DOC]:
        page_text = docs[h["doc_idx"]]["pages"][h["page_idx"]]
        # Take ~1-2 sentences per page as a nugget
        sentences = re.split(r"(?<=[.!?]) +", page_text)
        nugget = " ".join(sentences[:2]).strip()
        if nugget:
            bullets.append(f"- {nugget}")

    if mode == "bullets":
        body = "\n".join(bullets[:8]) or "- No specific instructions found."
        return (
            f"Below are concise steps/points related to your request:\n\n{body}\n\n"
            "If you’d like, I can execute or clarify any step."
        )

    if mode == "simple":
        summary = (bullets[0][2:] if bullets else
                   "We located relevant guidance and can proceed with the requested action once you confirm.")
        return (
            f"{summary}\n\n"
            "Reply if you want us to proceed, or let me know if you need a different approach."
        )

    # standard
    body = "\n".join(bullets[:6]) or "- Relevant guidance identified; confirm next steps."
    return (
        f"Thanks for your question. Based on our procedures, here’s the guidance:\n\n"
        f"{body}\n\n"
        "Please confirm if you’d like us to proceed or if further detail is needed."
    )

@app.get("/health")
def health():
    return {"ok": True, "pdf_folder": PDF_FOLDER, "pdf_count": len(list_pdfs(PDF_FOLDER))}

@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    if req.mode not in {"simple","bullets","standard"}:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {req.mode}")
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question is required")
        
    pdf_paths = list_pdfs(PDF_FOLDER)   # raises helpful errors
    docs = [{"path": p, "filename": os.path.basename(p), "pages": extract_pdf_text_by_page(p)}
            for p in pdf_paths]

    ranked = rank_pages(req.question, docs)
    if not ranked:
        return {"draft": "No relevant text found in procedures.", "sources": []}

    # select top docs by score (aggregate best page score per doc)
    best_by_doc = {}
    for h in ranked:
        di = h["doc_idx"]
        if di not in best_by_doc or h["score"] > best_by_doc[di]["score"]:
            best_by_doc[di] = {
                "score": h["score"],
                "doc_idx": di,
                "page_idx": h["page_idx"]
            }
    # sort by score
    top_docs = sorted(best_by_doc.values(), key=lambda x: x["score"], reverse=True)[:TOP_K_DOCS]

    # Build sources list
    sources = []
    for item in top_docs:
        d = docs[item["doc_idx"]]
        page_text = d["pages"][item["page_idx"]][:300]
        sources.append({
            "filename": d["filename"],
            "page": str(item["page_idx"] + 1),
            "snippet": page_text
        })

    # Build draft
    # also collect the top pages (across docs) to feed the draft builder
    top_hits = ranked[:TOP_K_DOCS * TOP_K_PAGES_PER_DOC]
    draft = build_draft(req.mode, req.question, top_hits, docs)
    return {"draft": draft, "sources": sources}

    
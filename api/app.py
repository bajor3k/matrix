
import os, re, glob, io
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from google.cloud import storage
from google.cloud.storage import Bucket
from google.iam.v1 import iam_policy_pb2

# --- CONFIGURATION ---
# The user-provided GCS paths for the PDFs to be used as the knowledge base.
PDF_PATHS = [
    "gs://matrix-y2jfw.firebasestorage.app/Advisor Services Procedure Guide.pdf",
    "gs://matrix-y2jfw.firebasestorage.app/Asset Movement Grid & LOA Signature Requirements.pdf",
    "gs://matrix-y2jfw.firebasestorage.app/Asset Movement Procedure Guide (3).pdf",
]
TOP_K_DOCS = 3            # how many PDFs to return
TOP_K_PAGES_PER_DOC = 2   # how many best pages per doc

# --- INITIALIZATION ---
app = FastAPI()

# Extract bucket name from the first GCS path to make it public
try:
    BUCKET_NAME = PDF_PATHS[0].split('/')[2]
except IndexError:
    raise ValueError("PDF_PATHS is not configured correctly. Cannot determine bucket name.")

# Initialize storage client
storage_client = storage.Client()

def make_bucket_public_read(bucket_name: str):
    """Makes a bucket's contents publicly readable."""
    try:
        bucket = storage_client.bucket(bucket_name)
        policy = bucket.get_iam_policy(requested_policy_version=3)
        
        # Add the 'allUsers' member with 'objectViewer' role.
        policy.bindings.append(
            {"role": "roles/storage.objectViewer", "members": {"allUsers"}}
        )
        
        bucket.set_iam_policy(policy)
        print(f"Bucket {bucket_name} is now publicly readable.")
    except Exception as e:
        print(f"Warning: Could not make bucket {bucket_name} public. If files are not accessible, this may be the cause. Error: {e}")

# Call on startup
make_bucket_public_read(BUCKET_NAME)


# Allow local Next.js dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC MODELS ---
class GenerateRequest(BaseModel):
    question: str
    mode: str  # "simple" | "bullets" | "standard"

class GenerateResponse(BaseModel):
    draft: str
    sources: List[Dict[str, str]]  # [{filename, page, snippet}]

# --- CORE LOGIC ---
def list_pdfs() -> List[str]:
    """Returns the hardcoded list of GCS PDF paths."""
    if not PDF_PATHS:
        raise HTTPException(status_code=500, detail="No PDF paths configured.")
    return PDF_PATHS

def extract_pdf_text_by_page(gcs_path: str) -> List[str]:
    """Downloads a PDF from GCS and extracts text from each page."""
    pages = []
    try:
        bucket_name, blob_name = gcs_path.replace("gs://", "").split("/", 1)
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        
        # Download the blob content into an in-memory bytes buffer
        pdf_content = io.BytesIO(blob.download_as_bytes())

        with pdfplumber.open(pdf_content) as pdf:
            for p in pdf.pages:
                text = p.extract_text() or ""
                # normalize whitespace
                text = re.sub(r"\s+", " ", text).strip()
                pages.append(text)
    except Exception as e:
        # Skip corrupt or inaccessible PDFs instead of crashing
        print(f"Error reading {os.path.basename(gcs_path)}: {e}")
        pages.append(f"[Error reading {os.path.basename(gcs_path)}: {e}]")
    return pages

def rank_pages(question: str, docs: List[Dict]) -> List[Dict]:
    """Ranks all pages from all documents against the question."""
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
    """Builds a draft response based on the top-ranked text snippets."""
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

# --- API ENDPOINTS ---
@app.get("/health")
def health():
    return {"ok": True, "pdf_source": "GCS", "pdf_count": len(list_pdfs())}

@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    if req.mode not in {"simple","bullets","standard"}:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {req.mode}")
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question is required")
        
    pdf_paths = list_pdfs()
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

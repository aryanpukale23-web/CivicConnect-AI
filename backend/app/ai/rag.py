import os
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Document, DocumentChunk
from app.ai.embeddings import get_text_embedding, compute_cosine_similarity, serialize_embedding, deserialize_embedding

def extract_text_from_file(file_path: str, file_type: str) -> str:
    """
    Extracts plain text from PDF, DOCX, or TXT file.
    """
    clean_type = file_type.lower().replace(".", "")
    text = ""
    
    if clean_type == "txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
            
    elif clean_type == "pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            pages_text = []
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    pages_text.append(extracted)
            text = "\n".join(pages_text)
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")
            
    elif clean_type == "docx":
        try:
            import docx
            doc = docx.Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            text = "\n".join(paragraphs)
        except Exception as e:
            print(f"Error reading DOCX {file_path}: {e}")
            
    # Normalize whitespaces
    text = re.sub(r"\s+", " ", text).strip()
    return text

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
    """
    Splits text into overlapping chunks for semantic retrieval.
    """
    if not text:
        return []
        
    sentences = re.split(r"(?<=[.!?\n]) +", text)
    chunks = []
    current_chunk = []
    current_length = 0
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        sentence_len = len(sentence)
        if current_length + sentence_len > chunk_size and current_chunk:
            chunk_str = " ".join(current_chunk)
            chunks.append(chunk_str)
            
            # Create overlap
            overlap_words = chunk_str.split()[-20:]
            current_chunk = [" ".join(overlap_words), sentence]
            current_length = len(current_chunk[0]) + sentence_len
        else:
            current_chunk.append(sentence)
            current_length += sentence_len
            
    if current_chunk:
        chunks.append(" ".join(current_chunk))
        
    return chunks

def index_document(db: Session, document_id: int) -> int:
    """
    Extracts text, creates chunks, computes embeddings, and stores in database.
    Returns number of chunks created.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not os.path.exists(doc.file_path):
        return 0
        
    text = extract_text_from_file(doc.file_path, doc.file_type)
    if not text:
        return 0
        
    chunks = chunk_text(text)
    
    # Delete old chunks if re-indexing
    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
    
    chunk_objs = []
    for idx, chunk in enumerate(chunks):
        embedding = get_text_embedding(chunk)
        chunk_obj = DocumentChunk(
            document_id=document_id,
            chunk_text=chunk,
            embedding=serialize_embedding(embedding),
            chunk_index=idx
        )
        chunk_objs.append(chunk_obj)
        
    db.add_all(chunk_objs)
    db.commit()
    return len(chunk_objs)

def search_similar_chunks(db: Session, query: str, top_k: int = 3, threshold: float = 0.25) -> List[Dict[str, Any]]:
    """
    Retrieves top-k relevant chunks matching the query using vector cosine similarity.
    """
    query_vec = get_text_embedding(query)
    all_chunks = db.query(DocumentChunk, Document).join(Document, DocumentChunk.document_id == Document.id).all()
    
    results = []
    for chunk, doc in all_chunks:
        chunk_vec = deserialize_embedding(chunk.embedding)
        sim = compute_cosine_similarity(query_vec, chunk_vec)
        if sim >= threshold:
            results.append({
                "chunk_id": chunk.id,
                "document_id": doc.id,
                "document_title": doc.title or doc.filename,
                "chunk_text": chunk.chunk_text,
                "similarity": sim
            })
            
    # Sort descending by similarity
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]

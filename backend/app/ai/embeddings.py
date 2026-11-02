import json
import math
import hashlib
from typing import List
import numpy as np

EMBEDDING_DIM = 64

def get_text_embedding(text: str) -> List[float]:
    """
    Produces a normalized vector embedding for a given text.
    Uses deterministic semantic n-gram frequency projection with sub-word feature hashing.
    If external AI_API_KEY is configured in production, it can be easily upgraded to an LLM provider.
    """
    clean_text = text.lower().strip()
    words = clean_text.split()
    vector = np.zeros(EMBEDDING_DIM, dtype=np.float32)
    
    if not clean_text:
        return vector.tolist()
        
    for word in words:
        # Word-level hash index
        h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
        idx = h % EMBEDDING_DIM
        sign = 1.0 if ((h >> 8) & 1) else -1.0
        vector[idx] += sign * (1.0 + math.log(1 + len(word)))
        
        # Character 3-grams for semantic morphology
        if len(word) >= 3:
            for i in range(len(word) - 2):
                ngram = word[i:i+3]
                nh = int(hashlib.sha256(ngram.encode("utf-8")).hexdigest(), 16)
                nidx = nh % EMBEDDING_DIM
                nsign = 1.0 if ((nh >> 8) & 1) else -1.0
                vector[nidx] += nsign * 0.5

    # L2 normalize
    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm
        
    return vector.tolist()

def compute_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))

def serialize_embedding(vec: List[float]) -> str:
    return json.dumps(vec)

def deserialize_embedding(vec_str: str) -> List[float]:
    try:
        return json.loads(vec_str)
    except Exception:
        return [0.0] * EMBEDDING_DIM

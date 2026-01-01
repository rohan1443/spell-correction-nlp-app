from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from logic import SpellCorrector
import os

app = FastAPI()

# Allow connections from Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Logic
# Ensure path is correct relative to where you run uvicorn
data_path = os.path.join("data", "data_to_be_cleansed.csv")
corrector = SpellCorrector(data_path)

class TextRequest(BaseModel):
    text: str

@app.get("/")
def home():
    return {"status": "ok", "vocab_size": len(corrector.vocab)}

@app.post("/analyze")
def analyze_text(req: TextRequest):
    results = corrector.analyze(req.text)
    return {"tokens": results}

@app.get("/corpus")
def get_corpus(search: str = ""):
    search = search.lower()
    matches = [
        {"word": k, "freq": v} 
        for k, v in corrector.vocab.items() 
        if search in k
    ]
    # Sort by freq and limit to 50
    matches.sort(key=lambda x: x['freq'], reverse=True)
    return matches[:50]
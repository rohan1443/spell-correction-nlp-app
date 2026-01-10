# spell-correction-nlp-app
Precision NLP spell correction app for Mental Health Corpora

<img width="1162" height="741" alt="image" src="https://github.com/user-attachments/assets/aae8de13-7812-44e0-a460-4ed31086aab6" />


```
# 🧠 MindScribe AI: Context-Aware Spelling Correction System
An advanced spelling correction system implementing Bayesian Inference, Noisy Channel Models,
and Kneser-Ney Smoothing to detect and correct both non-word typos and real-word context errors.

---

## 🚀 Project Overview

Standard spell checkers often fail at **Real-Word Errors** (e.g., typing *"their"* instead of *"there"*). MindScribe AI solves this by moving beyond simple dictionary lookups.

We implemented a **Probabilistic Noisy Channel Model** that combines:
1.  **Language Model (Prior):** Calculates $P(w_i | w_{i-1})$ using **Bigrams** with **Kneser-Ney Smoothing** to handle unseen contexts.
2.  **Error Model (Likelihood):** Calculates $P(w_{typo} | w_{intended})$ using **Damerau-Levenshtein Edit Distance**.

### Key Features
* **Context Sensitivity:** Distinguishes between "two", "to", and "too" based on the surrounding sentence.
* **Dual Error Detection:**
    * **Non-Words:** Flags words not in the vocabulary.
    * **Real-Words:** Flags valid words that are statistically improbable in the specific context.
* **Glass-Box Architecture:** Fully explainable AI. The UI shows the exact Edit Distance and Probability Score for every suggestion.
* **Corpus Explorer:** A dedicated tool to visualize the underlying frequency distribution of the Language Model.

---

## Tech Stack & Architecture

The project follows a **Client-Server Architecture** to ensure separation of concerns.

### **Frontend (Client)**
* **Framework:** React (Vite)
* **Styling:** Tailwind CSS (Glassmorphism Design)
* **Interaction:** Axios for API calls, Framer Motion for transitions.

### **Backend (Server)**
* **Framework:** FastAPI (Python)
* **NLP Engine:** Custom Python Class (No `TextBlob`/`Autocorrect` libraries used).
* **Data Processing:** Pandas & NumPy for efficient corpus handling.

### **Algorithm Details**
* **Tokenization:** Whitespace & Regex (Preserves contractions like "can't").
* **Smoothing:** Kneser-Ney (Backs off to unigram probability if bigram is unseen).
* **Search:** Candidates generated via Edit Distance 1 & 2.

---

## Installation & Setup

### Prerequisites
* Python 3.10+
* Node.js & npm

### 1. Clone the Repository
```bash
git clone git@github.com:rohan1443/spell-correction-nlp-app.git
cd spell-correction-nlp-app

```

### 2. Backend Setup (Python)

Navigate to the backend folder and set up the virtual environment.

```bash
cd backend

# Create virtual environment (using venv or uv)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API Server
uvicorn main:app --reload

```

*The backend will start at `http://127.0.0.1:8000*`

### 3. Frontend Setup (React)

Open a new terminal and navigate to the frontend folder.

```bash
cd frontend

# Install dependencies
npm install

# Start the Development Server
npm run dev

```

*The frontend will start at `http://localhost:5173*`

---

## Usage Guide

### The Smart Editor

1. **Input:** Type your text into the 500-character constrained text area.
* *Example:* "I want two go home."


2. **Analyze:** Click the ** Find Errors** button.
3. **Review:**
* Words highlighted in **RED** are typos (Non-words).
* Words highlighted in **YELLOW** are suspicious context errors (Real-words).


4. **Correct:** Click on any highlighted word to see a popup with ranked suggestions.
* Select a suggestion to instantly apply the fix.



### The Corpus Explorer

1. Switch to the **Corpus Explorer** tab.
2. Search for any word (e.g., "anxiety") to see its frequency count in the trained mental health dataset.
3. This validates why the model favors certain corrections over others.

---

## Deployment

The system is deployed on a distributed cloud architecture:

* **Frontend:** Hosted on **Vercel** (Global CDN).
* **Backend:** Hosted on **Railway** (Containerized Python Service).

**[🔗 Live Demo Link](https://www.google.com/search?q=https://your-vercel-link.app)** *(Replace this with your actual Vercel URL)*

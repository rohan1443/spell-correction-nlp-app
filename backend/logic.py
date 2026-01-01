import pandas as pd
import re
import os
from collections import Counter, defaultdict

class SpellCorrector:
    def __init__(self, data_path=None):
        self.vocab = {}
        self.bigram_counts = Counter()
        self.unique_followers = defaultdict(int)
        self.continuation_counts = defaultdict(int)
        self.total_bigram_types = 0
        
        # Check if file exists, otherwise use dummy data
        if data_path and os.path.exists(data_path):
            self.train(data_path)
        else:
            print(f"⚠️ Warning: Data file not found at {data_path}. Using dummy data.")
            self.train_dummy()

    def clean_text(self, text):
        text = str(text).lower()
        # Keep apostrophes, remove other special chars
        text = re.sub(r"[^a-z\s']", '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def train_dummy(self):
        self._build_model(pd.DataFrame({'clean_text': ["hello world this is a test"]}))

    def train(self, data_path):
        try:
            df = pd.read_csv(data_path)
            # Combine title and text columns if they exist
            cols = [c for c in df.columns if 'title' in c or 'text' in c]
            if not cols: 
                # Fallback: use all columns as text
                df['full_text'] = df.apply(lambda x: ' '.join(x.dropna().astype(str)), axis=1)
            else:
                df['full_text'] = df[cols].apply(lambda x: ' '.join(x.dropna().astype(str)), axis=1)
            
            df['clean_text'] = df['full_text'].apply(self.clean_text)
            self._build_model(df)
            print("✅ Model trained successfully.")
        except Exception as e:
            print(f"❌ Error training model: {e}")
            self.train_dummy()

    def _build_model(self, df):
        tokens = " ".join(df['clean_text'].values).split()
        
        # 1. Vocabulary (Min freq > 1)
        raw_counts = Counter(tokens)
        self.vocab = {k: v for k, v in raw_counts.items() if v > 1}
        
        # 2. Bigrams
        bigrams = []
        for i in range(len(tokens)-1):
            if tokens[i] in self.vocab and tokens[i+1] in self.vocab:
                bigrams.append((tokens[i], tokens[i+1]))
        
        self.bigram_counts = Counter(bigrams)
        
        # 3. Kneser-Ney Pre-calculation
        for w1, w2 in self.bigram_counts.keys():
            self.unique_followers[w1] += 1
            self.continuation_counts[w2] += 1
        self.total_bigram_types = len(self.bigram_counts)

    def get_kneser_ney_prob(self, w_prev, w_curr, d=0.75):
        # Term 1: Discounted Probability
        count_bigram = self.bigram_counts[(w_prev, w_curr)]
        count_prev = self.vocab.get(w_prev, 0)
        
        if count_prev > 0:
            term1 = max(count_bigram - d, 0) / count_prev
            lambda_weight = (d * self.unique_followers[w_prev]) / count_prev
        else:
            term1 = 0
            lambda_weight = 1.0 
            
        # Term 2: Continuation Probability
        cont_count = self.continuation_counts[w_curr]
        p_cont = cont_count / self.total_bigram_types if self.total_bigram_types > 0 else 0
        
        return term1 + (lambda_weight * p_cont)

    def edit_distance_1(self, word):
        letters = "abcdefghijklmnopqrstuvwxyz'"
        splits = [(word[:i], word[i:]) for i in range(len(word) + 1)]
        deletes = [L + R[1:] for L, R in splits if R]
        transposes = [L + R[1] + R[0] + R[2:] for L, R in splits if len(R)>1]
        replaces = [L + c + R[1:] for L, R in splits if R for c in letters]
        inserts = [L + c + R for L, R in splits for c in letters]
        return set(deletes + transposes + replaces + inserts)

    def get_candidates(self, word):
        # Generate candidates within 1 edit distance
        ed1 = self.edit_distance_1(word)
        candidates = {w: 1 for w in ed1 if w in self.vocab}
        
        # Always include original word (dist 0)
        if word in self.vocab:
            candidates[word] = 0
        else:
            candidates[word] = 0 # Keep it even if unknown
            
        # If sparse, try edit distance 2
        if len(candidates) < 2:
            ed2 = {e2 for e1 in ed1 for e2 in self.edit_distance_1(e1)}
            candidates.update({w: 2 for w in ed2 if w in self.vocab})
            
        return candidates

    def analyze(self, text):
        words = self.clean_text(text).split()
        response = []
        
        for i, word in enumerate(words):
            candidates = self.get_candidates(word)
            prev = words[i-1] if i > 0 else "<s>"
            
            scored_cands = []
            best_score = -1
            best_cand = word
            
            for cand, dist in candidates.items():
                # 1. Language Model Score
                lm_prob = self.get_kneser_ney_prob(prev, cand)
                
                # 2. Channel Model Score
                if dist == 0: channel = 0.95
                elif dist == 1: channel = 0.05
                else: channel = 0.01
                
                # Penalty if original word is unknown (likely typo)
                if word not in self.vocab and cand == word:
                    channel = 0.001
                
                score = lm_prob * channel
                scored_cands.append({"word": cand, "dist": dist, "score": score})
                
                if score > best_score:
                    best_score = score
                    best_cand = cand
            
            # Determine Error Type
            error_type = "None"
            if word not in self.vocab:
                error_type = "Non-word"
            elif best_cand != word:
                error_type = "Real-word"
            
            # Sort suggestions
            top_suggestions = sorted(scored_cands, key=lambda x: x['score'], reverse=True)[:3]
            
            response.append({
                "id": i,
                "original": word,
                "is_error": error_type != "None",
                "error_type": error_type,
                "best_fix": best_cand,
                "suggestions": top_suggestions
            })
            
        return response
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, BookOpen, AlertTriangle, CheckCircle, Type, SquareActivity } from 'lucide-react';

// Use Environment Variable for deployment, fallback to local for dev
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [inputText, setInputText] = useState("I want two go two the store to buy medicines for my anxieety isssues but i cant find my walleet.");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    setSelectedToken(null);
    try {
      const res = await axios.post(`${API_URL}/analyze`, { text: inputText });
      setAnalysis(res.data.tokens);
    } catch (err) {
      alert("Error connecting to backend. Is it running?");
      console.error(err);
    }
    setLoading(false);
  };

  const applyFix = (tokenIndex, newWord) => {
    // Update Analysis State
    const newAnalysis = [...analysis];
    newAnalysis[tokenIndex].original = newWord;
    newAnalysis[tokenIndex].is_error = false;
    newAnalysis[tokenIndex].error_type = "None";
    setAnalysis(newAnalysis);

    // Reconstruct Text (Visual only)
    const words = newAnalysis.map(t => t.original).join(" ");
    setInputText(words);
    setSelectedToken(null);
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-6 font-sans text-slate-800">

      {/* HEADER */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 flex justify-center items-center gap-3">
          <SquareActivity className="text-blue-600" size={50} /> MindScribeNLP Spell Corrector
        </h1>
        {/* <p className="text-xl font-semibold mt-6">Precision NLP for Mental Health Corpora</p> */}
        <p className="text-xl font-semibold mt-1">Decoding Support, One Word at a Time</p>
      </header>
      {/* SUBHEADER */}

      <p className="text-slate-600 max-w-3xl mx-auto mb-6 text-sm leading-relaxed">
        MindScribeNLP explores the statistical roots of Generative AI. By calculating the probability of word sequences, it mimics the early decoding steps of a Transformer model, replicating the foundation concepts.
        <br className="hidden md:block" />
        <span className="block mt-2 p-2 bg-slate-100 rounded-lg border border-slate-200">
          <strong className="text-slate-800">Constraint:</strong> This system utilizes a specific <em className="not-italic font-semibold text-slate-700">Mental Health corpus</em>, meaning its 'worldview' is limited to that domain. It is not a full-fledged correction system and is prone to errors when faced with unfamiliar vocabulary.
          It works best on sentences regarding emotions or therapy, but may produce hallucinations or misses on general text. Use it to visualize the math behind the magic.
        </span>
      </p>


      {/* TABS */}
      <div className="flex justify-center gap-4 mb-8">
        <TabButton icon={<Type size={18} />} label="Smart Editor" active={activeTab === 'editor'} onClick={() => setActiveTab('editor')} />
        <TabButton icon={<BookOpen size={18} />} label="Corpus Explorer" active={activeTab === 'corpus'} onClick={() => setActiveTab('corpus')} />
      </div>

      {/* EDITOR TAB */}
      {activeTab === 'editor' && (
        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT: INPUT */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <label className="font-semibold text-slate-700">Input Text</label>
              <span className={`text-xs px-2 py-1 rounded-full ${inputText.length > 500 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                {inputText.length}/500 chars
              </span>
            </div>
            <textarea
              className="w-full h-48 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-lg leading-relaxed"
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 500))}
              placeholder="Type something..."
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !inputText}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "✨ Find Errors"}
            </button>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
            <h3 className="font-semibold text-slate-700 mb-4">Analysis & Correction</h3>

            {!analysis && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Search size={48} className="mb-2 opacity-20" />
                <p>Waiting for input...</p>
              </div>
            )}

            {analysis && (
              <>
                <div className="flex flex-wrap gap-2 text-lg leading-loose mb-8">
                  {analysis.map((token, idx) => (
                    <span
                      key={idx}
                      onClick={() => token.is_error && setSelectedToken(token)}
                      className={`px-1 rounded cursor-pointer transition-all border-b-2 ${token.is_error
                        ? token.error_type === "Non-word"
                          ? "bg-red-50 border-red-400 text-red-800 hover:bg-red-100"
                          : "bg-amber-50 border-amber-400 text-amber-800 hover:bg-amber-100"
                        : "border-transparent"
                        }`}
                    >
                      {token.original}
                    </span>
                  ))}
                </div>

                {/* SUGGESTION CARD */}
                {selectedToken && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={18} className={selectedToken.error_type === "Non-word" ? "text-red-500" : "text-amber-500"} />
                      <span className="font-bold text-slate-700">Fix "{selectedToken.original}"</span>
                      <span className="ml-auto text-xs font-bold uppercase tracking-wider text-slate-400">{selectedToken.error_type}</span>
                    </div>

                    <div className="space-y-2">
                      {selectedToken.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => applyFix(selectedToken.id, sug.word)}
                          className="w-full flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all group"
                        >
                          <span className="font-medium">{sug.word}</span>
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded group-hover:bg-blue-50 group-hover:text-blue-500">
                            Dist: {sug.dist} • Score: {sug.score.toFixed(3)}
                          </span>
                        </button>
                      ))}
                      <button onClick={() => setSelectedToken(null)} className="w-full text-center text-sm text-slate-400 mt-2 hover:text-slate-600">Dismiss</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* CORPUS TAB */}
      {activeTab === 'corpus' && <CorpusExplorer />}

    </div>
  );
}

// --- COMPONENTS ---

function TabButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${active ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50'
        }`}
    >
      {icon} {label}
    </button>
  );
}

function CorpusExplorer() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      axios.get(`${API_URL}/corpus?search=${query}`).then(res => setData(res.data));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
        <input
          className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Search dictionary..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Word</th>
              <th className="p-4 font-semibold text-slate-600">Frequency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="p-4 font-medium">{row.word}</td>
                <td className="p-4 text-slate-500">{row.freq}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div className="p-8 text-center text-slate-400">No matches found</div>}
      </div>
    </div>
  );
}

export default App;
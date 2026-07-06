'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { MessageSquare, Send, Sparkles, AlertCircle, HelpCircle, Bot, User } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  createdAt?: string;
}

const SUGGESTIONS = [
  'Should I start here?',
  'Why is success low?',
  'How can I improve?',
  'What should I invest?',
  'Which business is best?'
];

function AIAssistantForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPredictionId = searchParams.get('predictionId') || '';

  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch prediction list
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const data = await api.get('/predictions/list');
        setPredictions(data);
        if (data.length > 0) {
          // Priority to query params, fallback to first in list
          const targetId = initialPredictionId && data.some((p: any) => p._id === initialPredictionId)
            ? initialPredictionId
            : data[0]._id;
          setSelectedId(targetId);
        } else {
          setLoadingHistory(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPredictions();
  }, [initialPredictionId]);

  // Fetch message history for selected prediction
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedId) return;
      setLoadingHistory(true);
      try {
        const response = await api.get(`/chat/history/${selectedId}`);
        setMessages(response.messages || []);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [selectedId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !selectedId || sending) return;
    
    setSending(true);
    setInputText('');

    // Prepend user message locally for latency illusion
    const newMsg: ChatMessage = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, newMsg]);

    try {
      const response = await api.post('/chat/message', {
        predictionId: selectedId,
        text: textToSend
      });
      setMessages(response.messages);
    } catch (err: any) {
      alert('Error communicating with AI assistant.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto flex flex-col h-[82vh]">
      
      {/* Header selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <MessageSquare className="h-6 w-6 text-indigo-400" />
            AI Business Advisor
          </h1>
          <p className="text-gray-400 text-sm mt-1">Ask questions about your budget allocation, competition margins, and location scores.</p>
        </div>

        {predictions.length > 0 && (
          <div className="flex items-center gap-2 bg-gray-950/20 p-2 rounded-xl border border-white/5">
            <span className="text-xs text-gray-500 font-semibold uppercase">Chat context:</span>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="glass-input text-xs py-1.5 pr-8 bg-gray-950/80 cursor-pointer focus:outline-none"
            >
              {predictions.map(p => (
                <option key={p._id} value={p._id}>{p.businessName} ({p.category})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {predictions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border-white/5 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-auto shrink-0">
          <MessageSquare className="h-10 w-10 text-gray-500 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">No Context Available</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Create a business success prediction coordinates card first to open a chat assistant thread.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          
          {/* Chat Window */}
          <div className="lg:col-span-3 glass-panel rounded-2xl border-white/5 flex flex-col min-h-0 bg-opacity-30 overflow-hidden">
            
            {/* Scrollable messages container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              {loadingHistory ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isAI = msg.sender === 'ai';
                  return (
                    <div 
                      key={idx} 
                      className={`flex gap-3 text-sm max-w-2xl ${
                        isAI ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center border ${
                        isAI ? 'bg-indigo-950/50 border-indigo-500/20 text-indigo-400' : 'bg-gray-900 border-white/5 text-gray-400'
                      }`}>
                        {isAI ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className={`p-4 rounded-2xl leading-relaxed whitespace-pre-line border ${
                        isAI 
                          ? 'bg-[#111827]/70 text-gray-200 border-white/5' 
                          : 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              {sending && (
                <div className="flex gap-3 mr-auto text-left max-w-md animate-pulse">
                  <div className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/20 text-indigo-400 shrink-0 h-9 w-9 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-[#111827]/70 text-gray-400 border border-white/5 text-xs">
                    Advisor is formulating demographic recommendations...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom input area */}
            <div className="p-4 border-t border-white/5 bg-gray-950/30 shrink-0">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Ask a question (e.g. Should I start here?)"
                  className="flex-1 glass-input text-xs"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="glass-button-primary p-3 flex items-center justify-center text-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

          </div>

          {/* Sidebar Suggestions */}
          <div className="space-y-4 shrink-0 hidden lg:block">
            <div className="glass-panel p-6 rounded-2xl border-white/5 text-left space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Quick Queries
              </h3>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Click any prompt to instantly query the model regarding your current coordinate predictions:
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSendMessage(s)}
                    disabled={sending}
                    className="w-full text-left p-2.5 rounded-lg bg-white/2 border border-white/5 text-xs text-gray-300 hover:bg-white/5 hover:border-white/10 transition-all font-medium disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading chatbot view...</div>}>
      <AIAssistantForm />
    </Suspense>
  );
}

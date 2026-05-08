import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, ShoppingBag } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import { triggerHaptic } from '../../utils/haptics';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyC9XCjfyFuyoYh01xOyufrKE2vkKGiC0EM' });

const SYSTEM_PROMPT = `You are a luxury personal stylist for WEARITION, a high-end Pakistani fashion brand. You help customers find perfect outfits.
Your personality: elegant, knowledgeable, warm but sophisticated — like a Harrods personal shopper.
When the user describes what they're looking for, extract key intent keywords like category (men/women/shirts/pants), occasion, style, and price range.
Always respond in 2-3 sentences max, then end with: [SEARCH: keyword1,keyword2] so the system can find matching products.
Example: "For a winter gala, I'd recommend our architectural wool pieces. [SEARCH: women,coats,luxury]"
If user greets, introduce yourself briefly. Keep responses warm and luxury-toned. Never mention prices unless asked.`;

export function AIStyleAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome to WEARITION. I'm your personal stylist. Tell me what you're looking for — an occasion, a mood, or a style you admire — and I'll curate the perfect pieces for you.",
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const searchProducts = async (keywords: string[]): Promise<any[]> => {
    try {
      const q = query(collection(db, 'products'), where('isPublished', '==', true));
      const snap = await getDocs(q);
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      return all.filter(p =>
        keywords.some(kw =>
          p.title?.toLowerCase().includes(kw) ||
          p.category?.toLowerCase().includes(kw) ||
          p.description?.toLowerCase().includes(kw)
        )
      ).slice(0, 3);
    } catch {
      return [];
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    triggerHaptic('light');

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const conversationHistory = messages.map(m => 
        `${m.role === 'user' ? 'Customer' : 'Stylist'}: ${m.content}`
      ).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `${SYSTEM_PROMPT}\n\nConversation:\n${conversationHistory}\nCustomer: ${input}\nStylist:`,
      });

      const text = response.text || "I'd love to help you find something special. Could you tell me more about the occasion?";
      
      // Extract search keywords
      const searchMatch = text.match(/\[SEARCH:\s*([^\]]+)\]/);
      const cleanText = text.replace(/\[SEARCH:[^\]]+\]/g, '').trim();
      
      let foundProducts: any[] = [];
      if (searchMatch) {
        const keywords = searchMatch[1].split(',').map(k => k.trim().toLowerCase());
        foundProducts = await searchProducts(keywords);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: cleanText,
        products: foundProducts.length > 0 ? foundProducts : undefined,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "My apologies — I'm experiencing a moment of silence. Please try again shortly.",
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => { setIsOpen(true); triggerHaptic('light'); }}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full liquid-glass flex items-center justify-center shadow-2xl border border-accent/30 text-accent"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Style Assistant"
      >
        <Sparkles className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-[380px] rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(30px)', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white">Style Assistant</p>
                  <p className="text-[10px] text-white/40">WEARITION Personal Stylist</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto px-4 py-4 flex flex-col gap-3 hide-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' 
                    ? 'bg-accent/20 text-white/90 rounded-2xl rounded-tr-sm' 
                    : 'bg-white/5 text-white/80 rounded-2xl rounded-tl-sm'
                  } px-4 py-3 text-xs font-sans leading-relaxed`}>
                    {msg.content}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 flex flex-col gap-2">
                        <p className="text-[10px] text-accent uppercase tracking-widest">Curated for you</p>
                        {msg.products.map(p => (
                          <Link
                            key={p.id}
                            to={`/product/${p.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors"
                          >
                            {p.images?.[0] && (
                              <img src={p.images[0]} alt={p.title} className="w-10 h-12 object-cover rounded" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-white truncate">{p.title}</p>
                              <p className="text-[10px] text-accent">{formatCurrency(p.price)}</p>
                            </div>
                            <ShoppingBag className="w-3 h-3 text-white/40" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-4 border-t border-white/5 flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Describe your style or occasion..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent hover:bg-accent hover:text-black transition-colors disabled:opacity-30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

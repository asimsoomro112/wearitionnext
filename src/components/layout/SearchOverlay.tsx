import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      closeSearch();
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[150] flex flex-col items-center pt-[15vh] md:pt-[20vh] px-6"
          >
            <button 
              onClick={closeSearch} 
              className="absolute top-8 right-8 text-white/50 hover:text-white hover:rotate-90 transition-all duration-300 p-2"
            >
              <X className="w-8 h-8" strokeWidth={1} />
            </button>

            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl flex flex-col items-center"
            >
              {/* Search Input Area */}
              <form onSubmit={handleSearch} className="w-full relative group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-white/30 group-focus-within:text-accent transition-colors duration-500" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-white/20 pb-4 pl-14 outline-none text-4xl md:text-6xl font-serif tracking-wide text-white placeholder-white/20 focus:border-accent transition-all duration-500"
                />
              </form>

              {/* Trending / Quick Links */}
              <div className="w-full mt-12 flex flex-col items-center opacity-0 animate-[fadeIn_1s_ease_0.3s_forwards]">
                <p className="uppercase text-[10px] tracking-[0.3em] text-white/40 mb-6 font-bold">Trending Searches</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Sculpted Gown', 'Velvet', 'Tech-Noir', 'Cashmere', 'Unstitched', 'Accessories'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        setTimeout(() => {
                          closeSearch();
                          navigate(`/shop?search=${encodeURIComponent(term)}`);
                          setSearchQuery('');
                        }, 100);
                      }}
                      className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/70 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-300"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

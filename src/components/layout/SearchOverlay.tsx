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
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-[50]"
          />
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 right-0 h-40 bg-background border-b border-foreground/10 z-[60] px-6 lg:px-24 flex items-center"
          >
            <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
              <form onSubmit={handleSearch} className="flex-1 flex items-center gap-4">
                <Search className="w-6 h-6 text-foreground/50" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-2xl font-serif tracking-wide text-foreground placeholder-foreground/30"
                />
              </form>
              <button onClick={closeSearch} className="ml-8 text-foreground/60 hover:text-foreground transition-colors p-2">
                <X className="w-8 h-8" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

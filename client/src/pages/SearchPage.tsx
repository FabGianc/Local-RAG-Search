import { useState, useRef, useEffect } from "react";
import { useSearch } from "@/hooks/use-search";
import { Layout } from "@/components/Layout";
import { SourceCard } from "@/components/SourceCard";
import { Search as SearchIcon, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const { mutate: performSearch, data, isPending, error } = useSearch();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: "Search Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isPending) return;
    performSearch(query);
  };

  const hasSearched = isPending || data !== undefined;

  return (
    <Layout>
      <div className="w-full min-h-[calc(100vh-6rem)] flex flex-col relative">
        
        {/* Search Header / Centered Hero */}
        <motion.div 
          className="w-full flex flex-col"
          animate={{ 
            justifyContent: hasSearched ? "flex-start" : "center",
            paddingTop: hasSearched ? "0rem" : "20vh"
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence>
            {!hasSearched && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.4 }}
                className="text-center mb-10"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold mb-6 border border-primary/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  RAG Powered
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight text-gradient mb-4">
                  What do you want to know?
                </h1>
                <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
                  Semantic search across your entire knowledge base. Instant answers with cited sources.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto z-20">
            <div className={`
              relative flex items-center bg-white rounded-2xl transition-all duration-300
              ${hasSearched ? 'shadow-sm border border-zinc-200' : 'shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-transparent'}
              focus-within:border-zinc-300 focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.12)]
              shimmer-border
            `}>
              <SearchIcon className="absolute left-6 w-6 h-6 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything..."
                className="w-full bg-transparent border-none outline-none py-5 pl-16 pr-20 text-lg text-zinc-900 placeholder:text-zinc-400"
                disabled={isPending}
              />
              <button
                type="submit"
                disabled={!query.trim() || isPending}
                className="absolute right-3 p-2.5 rounded-xl bg-zinc-900 text-white disabled:bg-zinc-100 disabled:text-zinc-400 transition-all duration-200 hover:bg-zinc-800 disabled:hover:bg-zinc-100"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results Area */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-10 flex-1 flex flex-col gap-8 pb-10"
            >
              {isPending ? (
                <div className="space-y-6">
                  <div className="glass-card rounded-3xl p-8 min-h-[200px] flex flex-col justify-center items-center text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="animate-pulse font-medium">Synthesizing answer from documents...</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
                    {[1,2,3].map(i => <div key={i} className="h-32 bg-zinc-100 rounded-2xl animate-pulse" />)}
                  </div>
                </div>
              ) : data ? (
                <>
                  {/* Answer Section */}
                  <div className="relative glass-card rounded-3xl p-8 md:p-10 bg-white">
                    <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/5 rounded-lg text-primary">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-zinc-900">Answer</h2>
                    </div>
                    
                    <div className="prose prose-zinc prose-lg max-w-none">
                      <p className="text-zinc-700 leading-relaxed font-medium">
                        {data.answer}
                      </p>
                    </div>
                  </div>

                  {/* Sources Section */}
                  {data.sources && data.sources.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider pl-2">
                        Referenced Sources ({data.sources.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.sources.map((source, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (idx * 0.1) }}
                            key={`${source.filename}-${idx}`}
                          >
                            <SourceCard 
                              index={idx + 1}
                              filename={source.filename} 
                              path={source.path} 
                              content={source.content} 
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
}

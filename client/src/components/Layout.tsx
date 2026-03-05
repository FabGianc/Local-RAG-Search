import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Search, FileText, Hexagon } from "lucide-react";
import { motion } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Research", icon: Search },
    { href: "/documents", label: "Knowledge Base", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 lg:w-72 bg-white border-b md:border-b-0 md:border-r border-zinc-200 flex-shrink-0 z-20 flex flex-col relative">
        <div className="p-6 md:p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-white shadow-md">
            <Hexagon className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-zinc-900 tracking-tight leading-none">Nexus</h1>
            <p className="text-xs text-zinc-500 font-medium mt-1 uppercase tracking-wider">Local RAG</p>
          </div>
        </div>

        <nav className="flex-1 px-4 pb-6 md:pb-8 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? "text-zinc-900 bg-zinc-100" 
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  }
                `}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-zinc-100 rounded-xl border border-zinc-200/50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? "text-zinc-900" : "text-zinc-400"}`} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative max-h-screen overflow-hidden flex flex-col">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-zinc-200/40 blur-3xl pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar p-6 md:p-10 lg:p-12">
          <div className="max-w-4xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

import { FileText, ChevronRight } from "lucide-react";

interface SourceCardProps {
  filename: string;
  path: string;
  content: string;
  index: number;
}

export function SourceCard({ filename, path, content, index }: SourceCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 group cursor-default relative overflow-hidden">
      {/* Number Badge */}
      <div className="absolute top-5 right-5 w-6 h-6 rounded-full bg-zinc-100 text-zinc-500 text-xs font-bold flex items-center justify-center">
        {index}
      </div>
      
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100 group-hover:bg-zinc-100 transition-colors">
          <FileText className="w-4 h-4 text-zinc-500" />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <h4 className="font-semibold text-zinc-900 truncate" title={filename}>
            {filename}
          </h4>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-zinc-400 font-mono truncate">
            <span>root</span>
            <ChevronRight className="w-3 h-3" />
            <span className="truncate" title={path}>{path}</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3 italic">
          "{content}"
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
      </div>
    </div>
  );
}

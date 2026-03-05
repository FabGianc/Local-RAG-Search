import { format } from "date-fns";
import { FileUpload } from "@/components/FileUpload";
import { useDocuments } from "@/hooks/use-documents";
import { Layout } from "@/components/Layout";
import { FileText, Calendar, HardDrive, Inbox } from "lucide-react";
import { motion } from "framer-motion";

export function DocumentsPage() {
  const { data: documents, isLoading, isError } = useDocuments();

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-10"
      >
        <section>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">Knowledge Base</h1>
          <p className="text-zinc-500 text-lg">Upload documents to expand your RAG index.</p>
        </section>

        <section>
          <FileUpload />
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-zinc-400" />
              Indexed Documents
            </h2>
            <div className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold">
              {documents?.length || 0} Files
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-zinc-100 rounded-2xl animate-pulse border border-zinc-200/50" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-red-600 font-medium">Failed to load documents.</p>
            </div>
          ) : documents?.length === 0 ? (
            <div className="py-16 text-center bg-white border border-zinc-200 border-dashed rounded-3xl flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">No documents yet</h3>
              <p className="text-zinc-500 mt-1">Upload your first document above to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents?.map((doc, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={doc.id} 
                  className="glass-card rounded-2xl p-5 flex items-start gap-4 group"
                >
                  <div className="p-3 bg-zinc-50 rounded-xl group-hover:bg-zinc-100 transition-colors border border-zinc-100">
                    <FileText className="w-6 h-6 text-zinc-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-zinc-900 truncate" title={doc.filename}>
                      {doc.filename}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(doc.createdAt), "MMM d, yyyy")}
                      </div>
                      <div className="truncate font-mono bg-zinc-100 px-2 py-0.5 rounded text-[10px]">
                        {doc.path}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </motion.div>
    </Layout>
  );
}

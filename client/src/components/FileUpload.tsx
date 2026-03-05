import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useUploadDocument } from "@/hooks/use-documents";
import { useToast } from "@/hooks/use-toast";

export function FileUpload() {
  const { mutateAsync: uploadDocument } = useUploadDocument();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    let successCount = 0;
    
    for (const file of acceptedFiles) {
      try {
        await uploadDocument(file);
        successCount++;
      } catch (error: any) {
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }
    
    setIsUploading(false);
    
    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully indexed ${successCount} document${successCount !== 1 ? 's' : ''}.`,
      });
    }
  }, [uploadDocument, toast]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt', '.md'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    disabled: isUploading
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        relative overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer shimmer-border
        ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300'}
        ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
        ${isUploading ? 'opacity-70 pointer-events-none' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center gap-4">
        <div className={`
          p-4 rounded-2xl transition-colors duration-300
          ${isDragActive ? 'bg-primary text-white' : 'bg-white text-zinc-500 shadow-sm border border-zinc-100'}
        `}>
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isDragActive ? (
            <UploadCloud className="w-8 h-8" />
          ) : (
            <File className="w-8 h-8" />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">
            {isUploading ? "Indexing Documents..." : isDragActive ? "Drop documents here" : "Add to Knowledge Base"}
          </h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
            Drag & drop PDF, Word, or text files here, or click to browse. We'll extract and index the text for semantic search.
          </p>
        </div>
        
        {!isUploading && !isDragActive && (
          <div className="mt-2 px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium shadow-lg shadow-zinc-900/20 hover:shadow-xl hover:shadow-zinc-900/30 hover:-translate-y-0.5 transition-all duration-200">
            Select Files
          </div>
        )}
      </div>
    </div>
  );
}

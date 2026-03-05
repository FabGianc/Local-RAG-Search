import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type DocumentsListResponse, type DocumentResponse } from "@shared/routes";

export function useDocuments() {
  return useQuery({
    queryKey: [api.documents.list.path],
    queryFn: async (): Promise<DocumentsListResponse> => {
      const res = await fetch(api.documents.list.path, { credentials: "include" });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch documents");
      }
      
      const parsed = api.documents.list.responses[200].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] documents.list validation failed:", parsed.error.format());
        throw new Error("Invalid response format");
      }
      
      return parsed.data;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File): Promise<DocumentResponse> => {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch(api.documents.upload.path, {
        method: api.documents.upload.method,
        body: formData, // Browser automatically sets multipart/form-data with boundary
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to upload document");
      }
      
      const parsed = api.documents.upload.responses[201].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] documents.upload validation failed:", parsed.error.format());
        throw new Error("Invalid response format");
      }
      
      return parsed.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path] });
    },
  });
}

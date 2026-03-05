import { useMutation } from "@tanstack/react-query";
import { api, type SearchRequest, type SearchResponse } from "@shared/routes";

export function useSearch() {
  return useMutation({
    mutationFn: async (query: string): Promise<SearchResponse> => {
      const payload: SearchRequest = { query };
      
      const res = await fetch(api.search.post.path, {
        method: api.search.post.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to execute search query");
      }
      
      const parsed = api.search.post.responses[200].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] search validation failed:", parsed.error.format());
        throw new Error("Received invalid response format from server");
      }
      
      return parsed.data;
    },
  });
}

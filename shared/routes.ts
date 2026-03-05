import { z } from 'zod';
import { insertDocumentSchema, documents } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  search: {
    post: {
      method: 'POST' as const,
      path: '/api/search' as const,
      input: z.object({
        query: z.string().min(1, "Query cannot be empty"),
      }),
      responses: {
        200: z.object({
          answer: z.string(),
          sources: z.array(
            z.object({
              filename: z.string(),
              path: z.string(),
              content: z.string(),
            })
          ),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
  documents: {
    list: {
      method: 'GET' as const,
      path: '/api/documents' as const,
      responses: {
        200: z.array(z.custom<typeof documents.$inferSelect>()),
      },
    },
    upload: {
      method: 'POST' as const,
      path: '/api/documents' as const,
      // Input is FormData
      responses: {
        201: z.custom<typeof documents.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type SearchRequest = z.infer<typeof api.search.post.input>;
export type SearchResponse = z.infer<typeof api.search.post.responses[200]>;
export type DocumentResponse = z.infer<typeof api.documents.upload.responses[201]>;
export type DocumentsListResponse = z.infer<typeof api.documents.list.responses[200]>;

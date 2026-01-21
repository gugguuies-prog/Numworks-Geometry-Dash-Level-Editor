import { z } from 'zod';
import { gameDataSchema, levelSchema } from './schema';

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
  levels: {
    list: {
      method: 'GET' as const,
      path: '/api/levels',
      responses: {
        200: gameDataSchema,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/levels',
      input: gameDataSchema,
      responses: {
        200: gameDataSchema,
        400: errorSchemas.validation,
      },
    },
    export: {
      method: 'GET' as const,
      path: '/api/export',
      responses: {
        200: z.string(), // Returns the python file content
      },
    },
    import: {
      method: 'POST' as const,
      path: '/api/import',
      responses: {
        200: gameDataSchema,
        400: errorSchemas.validation,
      },
    }
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

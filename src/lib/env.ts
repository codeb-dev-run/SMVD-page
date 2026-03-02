import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

/** Lazy-validated environment — only validates on first runtime access, not at build time */
export const env: Env = new Proxy({} as Env, {
  get(_, key: string) {
    if (!_env) {
      _env = envSchema.parse(process.env);
    }
    return _env[key as keyof Env];
  },
});

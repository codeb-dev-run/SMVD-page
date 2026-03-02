import { z } from 'zod';

// Only validate env vars actually accessed via `env.*`.
// Prisma manages DATABASE_URL internally — no need to duplicate here.
const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(1),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
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

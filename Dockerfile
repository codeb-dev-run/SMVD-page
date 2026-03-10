# SMVD CMS - Multi-stage Docker build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for native modules (sharp, bcrypt, etc.)
RUN apk add --no-cache libc6-compat openssl python3 make g++

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build (prisma generate + next build)
RUN npm run build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy built app and dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]

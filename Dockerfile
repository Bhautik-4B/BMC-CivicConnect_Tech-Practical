# syntax=docker/dockerfile:1
# -------------------------------------------------------------
# Stage 1: Build Monorepo (Shared, Server, Client)
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package manifests
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install all dependencies (including devDependencies for TypeScript compilation)
RUN npm ci

# Copy source files
COPY turbo.json tsconfig.json ./
COPY packages/shared/ ./packages/shared/
COPY server/ ./server/
COPY client/ ./client/

# Build all packages (Shared library, Server TypeScript, Vite Frontend)
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production Runtime
# -------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production-only dependencies
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm ci --omit=dev

# Copy compiled outputs from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

# Security: run as non-root user
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["node", "server/dist/server.js"]

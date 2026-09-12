# -------------------------------------------------------------
# Frontend NGINX Production Container
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY client/package*.json ./client/

RUN npm ci

COPY turbo.json tsconfig.json ./
COPY packages/shared/ ./packages/shared/
COPY client/ ./client/

RUN npm run build --workspace=@bmc/shared && npm run build --workspace=@bmc/client

FROM nginx:alpine AS runner

COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Estágio 1: Build
FROM node:22-alpine AS builder

# Instala a dependência do openssl obrigatória para o Prisma no Alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
ARG DATABASE_URL
RUN DATABASE_URL=${DATABASE_URL} npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Estágio 2: Produção
FROM node:22-alpine AS production

# Instala o openssl para o ambiente de produção
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
COPY prisma.config.ts ./
ARG DATABASE_URL
RUN DATABASE_URL=${DATABASE_URL} npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/modules ./src/modules

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
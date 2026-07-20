# --- Build stage -----------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Production stage -------------------------------------------------------
FROM node:22-alpine AS production
WORKDIR /app

# ffmpeg + ffprobe are required at runtime by the Listening seed script and
# by the Speaking module's real-time audio analysis (silence/pause detection).
RUN apk add --no-cache ffmpeg

ENV NODE_ENV=production
RUN addgroup -S bandwise && adduser -S bandwise -G bandwise

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Persisted at runtime via the `uploads` volume in docker-compose.yml —
# audio, speaking recordings, and generated books all live here.
RUN mkdir -p uploads/audio uploads/speaking-recordings uploads/books && \
    chown -R bandwise:bandwise uploads

USER bandwise
EXPOSE 4000

CMD ["node", "dist/main.js"]

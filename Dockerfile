# Stage 1: Build
FROM node:lts-alpine3.20 AS build

WORKDIR /app

# Copy package files dan install semua dependencies (termasuk devDependencies)
COPY package*.json ./
RUN npm install

# Copy semua source dan build
COPY . .
RUN npm run build

# Stage 2: Jalankan hasil build
FROM node:lts-alpine3.20 AS production

WORKDIR /app

# Salin hasil build dan node_modules dari stage build
COPY --from=build /app/.output .output/
COPY --from=build /app/node_modules node_modules/
COPY --from=build /app/package*.json ./

# Hapus NODE_ENV agar default (development)
# ENV NODE_ENV=production ← hapus baris ini

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

# Stage 1: Build
FROM node:lts-alpine3.20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:lts-alpine3.20 AS production

WORKDIR /app
COPY --from=build /app/.output ./.output
COPY package*.json ./
RUN npm install --production

# Port yang digunakan oleh aplikasi Nuxt.js
EXPOSE 3000

# Perintah untuk menjalankan aplikasi ketika container dijalankan
CMD ["node", ".output/server/index.mjs"]


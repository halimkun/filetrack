# Stage 1: Build
FROM node:lts-alpine3.20 AS build

WORKDIR /app

# Copy package files dan install dependencies
COPY package*.json ./
ENV NODE_ENV=production
RUN npm install

# Copy semua source dan build
COPY . .
RUN npm run build

# Stage 2: Run only the output
FROM node:lts-alpine3.20 AS production

WORKDIR /app

# Salin hasil build dari stage pertama
COPY --from=build /app/.output .output/
COPY --from=build /app/node_modules node_modules/
COPY --from=build /app/package*.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

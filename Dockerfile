# Gunakan image Node Alpine sebagai base image
FROM node:lts-alpine3.20

# Tentukan direktori kerja di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Install dependensi menggunakan npm
RUN npm install

# Salin kode aplikasi ke dalam container
COPY . .

# Port yang digunakan oleh aplikasi Nuxt.js
EXPOSE 3000

# Build aplikasi menggunakan npm
RUN npm run build

# Perintah untuk menjalankan aplikasi ketika container dijalankan
CMD ["node", ".output/server/index.mjs"]

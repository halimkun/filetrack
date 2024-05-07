# Gunakan image Node.js 18 sebagai base image
FROM node:18

# Tentukan direktori kerja di dalam container
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Install dependensi menggunakan npm
RUN npm install

# Salin kode aplikasi ke dalam container
COPY . .

# Build aplikasi menggunakan npm
RUN npm run build

# Port yang digunakan oleh aplikasi Nuxt.js
EXPOSE 3000

# Perintah untuk menjalankan aplikasi ketika container dijalankan
CMD ["node", ".output/server/index.mjs"]

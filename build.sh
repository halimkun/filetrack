#!/bin/sh

# Menghasilkan tag berdasarkan tanggal dan waktu (format: YYYYMMDD-HHMM)
# tag=$(date +'%Y%m%d-%H%M')
tag=$(date +'%Y%m%d')
appName="filetrack"

# Menampilkan pesan memulai build
echo "+ ===== Starting Docker build for application: $appName"
echo "+ ===== Generated tag: $tag"

# Membangun image dengan tag
echo "+ ===== Building Docker image..."
docker build -t $appName:$tag .

# Menangani kesalahan build
if [ $? -ne 0 ]; then
  echo "- ===== Docker build failed. Exiting."
  exit 1
fi

# Menandai image sebagai latest
echo "+ ===== Tagging Docker image as latest..."
docker tag $appName:$tag $appName:latest

# Menangani kesalahan tagging
if [ $? -ne 0 ]; then
  echo "- ===== Tagging Docker image failed. Exiting."
  exit 1
fi

# Menampilkan pesan sukses
echo "+ ===== Docker image built and tagged successfully."
echo "+ ===== Docker image built with tag: $tag"
echo "+ ===== Docker image also tagged as: latest"

#!/bin/bash

echo "🚀 Iniciando deploy..."

git pull origin main

echo "Parando containers antigos..."
docker compose down

echo "Build e start dos containers..."
docker compose up -d --build

echo "Deploy concluído!"

#!/usr/bin/env bash
set -e

docker run --rm -it \
  -p 3000:3000 \
  -e HOST=0.0.0.0 \
  -e CHOKIDAR_USEPOLLING=true \
  -v "$PWD":/app \
  -w /app \
  node:20-alpine sh -lc "npm install && npm start"

FROM node:22-bullseye-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=10000
ENV WRANGLER_WRITE_LOGS=false
ENV WRANGLER_LOG_PATH=.wrangler/wrangler.log
ENV MINIFLARE_REGISTRY_PATH=.wrangler/registry

EXPOSE 10000

CMD ["npm", "start"]

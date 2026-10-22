FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY public ./public
COPY scripts ./scripts
ARG VERSION=dev
RUN VERSION=$VERSION npm run prepare:static
FROM node:24-alpine
ENV NODE_ENV=production PORT=8080 DATA_DIR=/data
WORKDIR /app
# Community levels are stored here; mount a volume so they survive restarts and upgrades.
RUN mkdir -p /data && chown node:node /data
COPY --from=build --chown=node:node /app/public ./public
COPY --chown=node:node server ./server
# The recorded winning runs: the admin's level workshop draws and replays them.
COPY --chown=node:node tests/fixtures ./tests/fixtures
VOLUME /data
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","server/index.cjs"]

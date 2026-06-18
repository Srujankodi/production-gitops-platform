FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci


FROM node:22-alpine AS test

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

RUN npm test


FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

RUN chown -R node:node /app

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]
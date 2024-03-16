FROM node:alpine3.19 AS base

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
ENV PORT=3000

WORKDIR /app

RUN \
  apk --no-cache upgrade && \
  apk add --no-cache ttf-opensans unifont ca-certificates chromium dumb-init && \
  rm -rf /tmp/*

################

FROM base as dev-deps
COPY package*.json ./
RUN npm install

################

FROM base as prod-deps
COPY package*.json ./
RUN npm install --omit=dev

################

FROM base as build
COPY tsconfig.json ./
COPY package*.json ./
COPY src /app/src
COPY --from=dev-deps /app/node_modules /app/node_modules
RUN npm run build

################

FROM base as production

LABEL maintainer="Bujupah Tech <contact@bujupah.tech>"

ENV NODE_ENV=production

COPY .env /app/.env 
COPY assets /app/assets
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=prod-deps /app/node_modules /app/node_modules

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "run", "start"]
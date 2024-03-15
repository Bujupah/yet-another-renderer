FROM node:alpine3.19 as build

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY .puppeteerrc.cjs /app/.puppeteerrc.cjs
COPY src /app/src

RUN npm install
RUN npm get:chrome
RUN npm run build

# # # # # # # # # # # 
# Production Stage  #
# # # # # # # # # # # 
FROM node:alpine3.19 as production

WORKDIR /app

RUN apk add --no-cache tzdata

COPY .env /app/.env 
COPY assets /app/assets

COPY --from=build /app/dist ./dist
COPY --from=build /app/chrome ./chrome
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE ${PORT}

CMD ["npm", "run", "start"]
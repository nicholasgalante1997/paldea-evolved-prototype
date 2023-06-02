FROM node:18-buster-slim

RUN mkdir -p /app/node/paldea-evolved

WORKDIR /app/node/paldea-evolved

COPY package.json .

RUN npm install 

COPY ./src/ ./src/ 

COPY .tsconfig .tsconfig 

COPY .env .env 

COPY .babelrc .babelrc 

COPY ./build-config/ ./build-config/

RUN npm run build 

RUN rm -rf node_modules/ \
    src/ \
    .tsconfig \
    .babelrc \
    build-config/ 

RUN npm install --only=production

CMD ["npm", "run", "start"]
FROM docker.io/node:16-alpine3.16

WORKDIR /usr/app

COPY package*.json ./

RUN npm install
RUN npm ci --only=production

COPY ./src ./src

EXPOSE 3000

CMD [ "node", "./src/app.js" ]

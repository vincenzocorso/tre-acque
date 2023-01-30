FROM docker.io/node:19.5-alpine as build
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm install
COPY ./public ./public
COPY ./src ./src
RUN npm run build

FROM docker.io/nginx:1.23-alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/build ./
COPY .env.example .env
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d
RUN apk add --update nodejs
RUN apk add --update npm
RUN npm install -g runtime-env-cra@0.2.4

EXPOSE 80
CMD ["/bin/sh", "-c", "runtime-env-cra && nginx -g \"daemon off;\""]

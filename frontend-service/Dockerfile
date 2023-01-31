# Copyright (c) 2022-2023, Tre Acque.
#
# This file is part of Tre Acque.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

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

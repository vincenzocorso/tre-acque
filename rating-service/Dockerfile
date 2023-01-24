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

FROM docker.io/golang:1.19 as build
LABEL org.opencontainers.image.authors="e.petriglia@campus.unimib.it"

# Disable CGO to build a self-contained executable.
ENV CGO_ENABLED 0

WORKDIR /app

# Copy go.mod and go.sum before coping the code to cache the deps.
COPY go.* ./
RUN go mod download -x && go mod verify

COPY *.go ./
RUN go build -v -o rating-service .

# The second stage copies only the binary to get a small image size.
FROM docker.io/alpine:3.17

COPY --from=build /app/rating-service /app/

EXPOSE 8080
ENTRYPOINT ["/app/rating-service"]


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


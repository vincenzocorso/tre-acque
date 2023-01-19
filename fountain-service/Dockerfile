# The first stage compiles the quarkus app. Some notes:
# - To avoid ineffiencies (and to use the cache) it copies first the gradle build files and install all the dependencies
# - After it copies the source files and compiles the app
# ==> if we change only the source files, it doesn't re-install all the dependencies
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY gradle gradle
COPY build.gradle settings.gradle gradle.properties gradlew ./
RUN ./gradlew quarkusBuild --info
COPY ./src ./src
RUN ./gradlew quarkusBuild --info

# The second stage copies only the strictly necessary to execute the app
# It uses a base image containing only the jre
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/quarkus-app /app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "./quarkus-run.jar"]
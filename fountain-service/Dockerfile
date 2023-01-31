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

# The first stage compiles the quarkus app. Some notes:
# - To avoid ineffiencies (and to use the cache) it copies first the gradle build files and install all the dependencies
# - After it copies the source files and compiles the app
# ==> if we change only the source files, it doesn't re-install all the dependencies
FROM docker.io/eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY gradle gradle
COPY build.gradle settings.gradle gradle.properties gradlew ./
RUN ./gradlew quarkusBuild --info
COPY ./src ./src
RUN ./gradlew quarkusBuild --info

# The second stage copies only the strictly necessary to execute the app
# It uses a base image containing only the jre
FROM docker.io/eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/quarkus-app /app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "./quarkus-run.jar"]

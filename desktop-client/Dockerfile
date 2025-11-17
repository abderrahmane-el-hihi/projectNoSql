FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Spring Boot creates executable jar - copy the built jar
COPY --from=build /workspace/target/desktop-client-*.jar /app/desktop-client.jar
# API_BASE_URL is set via docker-compose.yml environment variable
# This is a web application, accessible via HTTP on port 8080
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/desktop-client.jar"]

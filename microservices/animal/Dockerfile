FROM --platform=linux/amd64 amazoncorretto:17
COPY target/animal-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
# Dockerfile backend
FROM node:16.14

WORKDIR /usr/src/app

ARG APP_PORT=5000
ENV APP_PORT=5000
ARG FRONTEND_URL=https://www.gloriousrp.fr/irene
ENV FRONTEND_URL=https://www.gloriousrp.fr/irene
ARG BACKEND_URL=https://www.gloriousrp.fr/irene
ENV BACKEND_URL=https://www.gloriousrp.fr/irene
ARG DB_HOST=172.17.0.1
ENV DB_HOST=172.17.0.1
ARG DB_USER=irene_db
ENV DB_USER=irene_db
ARG DB_PASSWORD=CWtJ2Nn2VaUWMcHu
ENV DB_PASSWORD=CWtJ2Nn2VaUWMcHu
ARG DB_NAME=irene_db
ENV DB_NAME=irene_db
ARG JWT_SECRET=54446969d8db45ecad2dbff32185e28fab3ca4e139c1b20a351fa9
ENV JWT_SECRET=54446969d8db45ecad2dbff32185e28fab3ca4e139c1b20a351fa9

RUN ping 8.8.8.8
RUN ping www.tf1.fr

COPY . .

RUN npm install
RUN npm run migrate

ENTRYPOINT npm start
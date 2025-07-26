FROM node

WORKDIR /app
COPY ./app .
RUN npm install --save -g pm2
RUN npm install

EXPOSE 3000

CMD pm2 start --no-daemon ./server.js
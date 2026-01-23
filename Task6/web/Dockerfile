FROM node:20-alpine
WORKDIR /app

COPY Task6/web/package*.json ./
RUN npm ci || npm install

COPY Task6/web ./

EXPOSE 3000
CMD ["npm","start"]

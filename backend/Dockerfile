
FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY backend/package*.json ./backend/
RUN npm ci --prefix backend

COPY . .

EXPOSE 3000

CMD ["npm", "--prefix", "backend", "run", "dev"]

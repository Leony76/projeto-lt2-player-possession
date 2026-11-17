FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend

COPY . .

EXPOSE 5173

CMD ["npm", "--prefix", "frontend", "run", "dev", "--", "--host", "0.0.0.0"]
